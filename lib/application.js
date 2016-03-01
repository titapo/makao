// application

var g_logger = new Logger("makao", "info");
var g_context;
var g_rootNode;
var g_actionList;
var g_baseArea;
var g_handler;

function goToNode(node)
{
    g_context.view.goTo(node);
}

function goToBase()
{
    g_context.view.goUp();
}

function goToChild(childName)
{
    g_context.view.goToChild(childName);
}

function deleteChild(childName)
{
    var child = g_context.view.getCurrentNode().getChild(childName);
    if (child === undefined)
        throw "Child '" + childName + "' does not exist!";

    var form = new Form("Delete child");
    form.submit = function(values)
    {
        g_context.view.getCurrentNode().remove(childName);
        DisplayActualNode();
        g_context.feedback("'" + childName + "' removed");
        return true;
    }

    var layer = new Layer("win-layer");
    layer.displayForm(form);
    SetCurrentForm(form);
}

function updateChild(childName)
{
    var child = g_context.view.getCurrentNode().getChild(childName);
    if (child === undefined)
        throw "Child '" + childName + "' does not exist!";

    var form = child.createForm("Update child");

    form.submit = function(values)
    {
        var name = this.inputs["name"].value;

        if (name.length === 0)
            return false;

        if (name !== child.name)
        {
            var actualNode = g_context.view.getCurrentNode();
            if (actualNode.getChild(name) !== undefined)
            {
                // TODO message for the user
                var msg = actualNode.name + " already has a child with name: '" + name +"'";
                g_context.feedback(msg, FeedbackLevel.Error);
                throw msg;
            }
        }

        child.name = name;

        if (child instanceof Leaf)
            child.content = this.inputs["content"].value;

        DisplayActualNode();
        return true;
    }

    var layer = new Layer("win-layer");
    layer.displayForm(form);
    SetCurrentForm(form);
}

function createChildEntity(identifier)
{
    var entity = g_context.entityFactory.create(identifier);
    var form = entity.createForm("Create new " + identifier);
    form.submit = function()
    {
        var name = this.inputs["name"].value;
        /*
         * TODO validation
        if (name.length === 0)
            return false;
            */
        var actualNode = g_context.view.getCurrentNode();
        if (actualNode.getChild(name) !== undefined)
        {
            var msg = actualNode.name + " already has a child with name: '" + name +"'";
            g_context.feedback(msg, FeedbackLevel.Error);
            throw msg;
        }

        for (var key in this.inputs)
        {
            entity[key] = this.inputs[key].value;
        }

        actualNode.add(entity);
        //refresh
        DisplayActualNode();

        g_context.feedback("New " + identifier + " created with name: " + name);
        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);

    SetCurrentForm(form); // set on g_context
}

function openNewView(childName)
{
    g_logger.info("openNewView()");
    var path = new Path([g_context.view.getPath(), childName]);
    g_logger.info("path:" + path.display());
    g_context.view.createSubView("secondary", path);
}

function generateNodeOutput()
{
    var node = g_context.view.getCurrentNode();
    var win = new Window(node.name + " output");
    var field = new TextFormField("JSON output", "output", node.generateOutput());
    win.setContent(field.display());

    var layer = new Layer("win-layer");
    layer.displayWindow(win);
}

// TODO rename to Controller as soon as possible
function StorageOperationHandler(context)
{
    this.context = context;
}
StorageOperationHandler.prototype = {
    context: null,
    store: function()
    {
        this.context.store();
        this.context.feedback("Data stored to storage");
    },
    load: function()
    {
        this.context.load();
        this.context.feedback("Data loaded from storage")
    },
    clear: function()
    {
        this.context.clearStorage();
        this.context.feedback("Storage cleared");
    },
    changeStorage: function()
    {
        var form = new Form("Change Storage");
        var _this = this;
        form.submit = function(values)
        {
            try
            {
                _this.context.selectStorage(this.inputs['storage'].value);
                DisplayActualNode();
                _this.context.feedback("Storage changed");
                return true;
            }
            catch(err)
            {
                g_logger.error(err.message);
            }
        }
        var storages = this.context.getStorageDict();
        var options = {};
        for (var name in storages)
        {
            options[name] = name;
        }
        var selector = new RadioFormField("Storage", "storage", options);
        form.addInput(selector);

        var layer = new Layer("win-layer");
        layer.displayForm(form);
        SetCurrentForm(form);
    }
}

function GenerateTree()
{
    var root = new Node("root");
    {
        var constNode = new Node("makao");
        {
            var info = new Node("info");
            info.add(new Leaf("program", "makao"));
            info.add(new Leaf("version", "v0.0"));
            info.add(new Leaf("author", "titapo"));
            constNode.add(info);
        }
        root.add(constNode);
    }
    root.add(new Leaf("README", "- todo -"))
    root.add(new Leaf("TODO", "- todo -"))

    return root;
}

function CreateActionList()
{
    var actions = new ActionList();
    actions.set("base-link", function(node)
    {
        if (node.base == 0)
            return "";

        return ActionButton(node.base.name, "goToBase()");
    });

    actions.set("go-to-child", function(node)
    {
        return ActionButton("go", "goToChild('" + node.name +"')");
    });

    actions.set("node-actions", function(node)
    {
        var result = "";
        var childCreation = new Menu("Create ...", default_menu);
        var typeList = g_context.entityFactory.listTypenames();
        for (var index in typeList)
        {
            var typename = typeList[index];
            childCreation.add(ActionButton(typename,
                    new Action(new Callback(createChildEntity), 'create-child').display(typename)));
        }
        result += childCreation.display();

        if (g_context.hasStorage())
        {
            var menu = new Menu("Storage | " + g_context.getStorageName(), default_menu);
            menu.add(Tag('p', "Type: " + g_context.getActiveStorageHandler().type,  {'class':'static'}));
            menu.add(Tag('p', "Path: " + g_context.getActiveStorage().path.display(),  {'class':'static'}));

            menu.add(ActionButton("load", new Action(new Callback(g_handler, g_handler.load), "load").display()));
            menu.add(ActionButton("store", new Action(new Callback(g_handler, g_handler.store), "store").display()));
            menu.add(ActionButton("clear", new Action(new Callback(g_handler, g_handler.clear), "clear").display()));
            menu.add(ActionButton("change storage", new Action(new Callback(g_handler, g_handler.changeStorage), "change-storage").display()));

            result += menu.display();
        }
        return result;
    });

    actions.set("child-modify", function(child)
    {
        return ["update",
            "remove",
            "move-up",
            "move-down",
            "create-view"];
        ;
        /*
        return ActionButton("update", "updateChild('" + child.name + "')")
            + ActionButton("remove", "deleteChild('" + child.name + "')")
            + ActionButton("^", "moveUpChild('" + child.name + "')")
            + ActionButton("v", "moveDownChild('" + child.name + "')")
            + ActionButton("<>", "openNewView('" + child.name + "')")
        ;
        */
    });

    return actions;
}

function getDefaultConfig()
{
    return {
        "logLevel":"info",
        "style":"style/basic.css"
    }
}
function LoadGlobalConfig(ctx, filename)
{
    var fh = new FileHandler(filename);
    fh.setCallback(function(configString)
    {
        ctx.setConfig(getDefaultConfig());
        g_logger.info("loading global config");

        try
        {
        var input = "{" + configString + "}";
        var config = JSON.parse(input);
        for (var propertyName in config)
            g_logger.debug(" config: " + propertyName + " : " + config[propertyName]);

        // TODO validating
        if (true)
        {
            ctx.overrideConfig(config);
        }
        else
        {
            g_context.feedback("could not verify global config", FeedbackLevel.Error);
        }

        Logger.setLogLevel(ctx.config["logLevel"]);
        g_context.feedback("global configuration loaded");
        g_logger.info("load stylesheet: " + ctx.config["style"]);
        g_logger.info(document.getElementsByTagName("link").item(0).setAttribute("href", ctx.config["style"]));
        }
        catch (e)
        {
            if (e instanceof SyntaxError)
            {
                g_context.feedback("Error during config loading: " + e.message);
            }
        }
        
    });
    fh.read();
}

function InitView(message, level)
{
    var feedbackArea = g_context.view.createSubArea("general-feedback");
    feedbackArea.id = "g_feedback";
    feedbackArea.className = "feedback-container";
    g_context.setFeedback(function(message, level)
            {
                var messageNode = document.createElement("div");
                var cls = "";
                switch (level)
                {
                    case FeedbackLevel.Normal:
                        cls = " success";
                        break;
                    case FeedbackLevel.Warning:
                        cls = " warning";
                        break;
                    case FeedbackLevel.Error:
                        cls = " error";
                        break;
                }
                messageNode.className = "msg" + cls;
                messageNode.innerHTML = message;
                feedbackArea.appendChild(messageNode);
                setTimeout(function () {
                    feedbackArea.removeChild(messageNode)
                }, 5000);
            });
}

function Init()
{
    g_logger.info("Init");
    // tree generation
    g_rootNode = GenerateTree();

    g_context = new Context(g_rootNode);
    g_baseArea = document.getElementById("base-area"); // base area
    g_actionList = CreateActionList(); // actions for tree handling/display
    g_context.view.init(g_baseArea, g_actionList);
    InitView();

    g_handler = new StorageOperationHandler(g_context);

    g_context.entityFactory.setType("leaf", Leaf);
    g_context.entityFactory.setType("node", Node);
    g_context.entityFactory.setType("text-leaf", TextLeaf);
    g_context.entityFactory.setType("link-leaf", LinkLeaf);
    /*
    g_context.entityFactory.setType("boolean-leaf", BooleanLeaf);
    g_context.entityFactory.setType("enum-leaf", EnumLeaf);
    */

    LoadGlobalConfig(g_context, "file:global/global.conf");
}

function DisplayActualNode()
{
    if (typeof g_baseArea === 'undefined')
        throw "Entity is uninitialized";

    g_context.view.display();
}
