// application

var g_logger = new Logger("makao", "info");
var g_context;
var g_rootNode;
var g_actionList;
var g_baseArea;

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

function moveUpChild(childName)
{
    g_logger.debug("moveUpChild()");
    // check whether is it the first
    var index = g_context.view.getCurrentNode().getChildIndex(childName);
    if (index <= 0)
        return false;


    children = g_context.view.getCurrentNode().children;
    var swapWith = index - 1;
    children[index] = children.splice(swapWith, 1, children[index])[0];
    DisplayActualNode();

    return true;
}

function moveDownChild(childName)
{
    g_logger.debug("moveDownChild()");
    // check whether is it the last
    var index = g_context.view.getCurrentNode().getChildIndex(childName);
    if (index == -1 || index >= g_context.view.getCurrentNode().children.length - 1)
        return false;


    children = g_context.view.getCurrentNode().children;
    var swapWith = index + 1;
    children[index] = children.splice(swapWith, 1, children[index])[0];
    DisplayActualNode();

    return true;
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

function loadNode()
{
    var form = new Form("Load node from user");
    form.addInput(new TextFormField("JSON input", "json"));
    form.submit = function (values)
    {
        var json = this.inputs["json"].value;

        var node = createTreeFromString(json, g_context.entityFactory);

        g_context.view.loadChild(node);
        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);

    SetCurrentForm(form); // set on g_context
}

function STORE_NODE()
{
    g_context.store();
}
function LOAD_NODE()
{
    g_context.load();
}
function CLEAR_STORAGE()
{
    g_context.clearStorage();
    g_context.feedback("Storage cleared");
}
function CHANGE_STORAGE()
{
    var form = new Form("Change Storage");
    form.submit = function(values)
    {
        try
        {
            g_context.selectStorage(this.inputs['storage'].value);
            DisplayActualNode();
            g_context.feedback("Storage changed");
            return true;
        }
        catch(err)
        {
            g_logger.error(err.message);
        }
    }
    var storages = g_context.getStorageDict();
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
    var actionLink = function(title, action)
    {
        g_logger.debug("actionLink: " +  title + " > " + action);
        return Tag("a", title, {"class":"action", "onclick":action});
    }
    actions.set("base-link", function(node)
    {
        if (node.base == 0)
            return "";

        return actionLink(node.base.name, "goToBase()");
    });

    actions.set("go-to-child", function(node)
    {
        return actionLink("go", "goToChild(\"" + node.name +"\")");
    });

    actions.set("node-actions", function(node)
    {
        var result = "";
        var childCreation = new Menu("Create ...", default_menu);
        var typeList = g_context.entityFactory.listTypenames();
        for (var index in typeList)
        {
            var typename = typeList[index];
            childCreation.addElement(typename, "createChildEntity(\"" + typename + "\")");
        }
        result += childCreation.display();

        result += actionLink("output", "generateNodeOutput()")
        + actionLink("load children", "loadNode()");
        
        if (g_context.hasStorage())
        {
            var menu = new Menu("Storage | " + g_context.getStorageName(), default_menu);
            menu.addStaticField("Path", "Path: " + g_context.getStoragePath().display());
            menu.addElement("load", "LOAD_NODE()");
            menu.addElement("store", "STORE_NODE()");
            menu.addElement("clear", "CLEAR_STORAGE()");
            menu.addElement("change storage", "CHANGE_STORAGE()");

            result += menu.display();
        }
        return result;
    });

    actions.set("child-modify", function(child)
    {
        return actionLink("update", "updateChild(\"" + child.name + "\")")
            + actionLink("remove", "deleteChild(\"" + child.name + "\")")
            + actionLink("^", "moveUpChild(\"" + child.name + "\")")
            + actionLink("v", "moveDownChild(\"" + child.name + "\")")
        ;
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

    LoadGlobalConfig(g_context, "file:global/global.conf");

    g_context.entityFactory.setType("leaf", Leaf);
    g_context.entityFactory.setType("node", Node);
    g_context.entityFactory.setType("text-leaf", TextLeaf);
    g_context.entityFactory.setType("link-leaf", LinkLeaf);
    /*
    g_context.entityFactory.setType("boolean-leaf", BooleanLeaf);
    g_context.entityFactory.setType("enum-leaf", EnumLeaf);
    */

    g_baseArea = document.getElementById("base-area"); // base area
    g_actionList = CreateActionList(); // actions for tree handling/display
    g_context.view.init(g_baseArea, g_actionList);

    InitView();


}

function DisplayActualNode()
{
    if (typeof g_baseArea === 'undefined')
        throw "Entity is uninitialized";

    g_context.view.display();
}
