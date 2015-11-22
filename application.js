// application

var g_logger = new Logger("makao", "info");
var g_context;
var g_rootNode;
var g_actualNode;
var g_actionList;
var g_baseArea;

function goToNode(node)
{
    if (!(node instanceof Node))
        throw "goToNode(): not a node!";

    g_actualNode = node;
    DisplayActualNode();
}

function goToBase()
{
    goToNode(g_actualNode.base);
}

function goToChild(childName)
{
    var node = g_actualNode.getChild(childName);
    goToNode(node);
}

function deleteChild(childName)
{
    var child = g_actualNode.getChild(childName);
    if (child === undefined)
        throw "Child '" + childName + "' does not exist!";

    var form = new Form("Delete child");
    form.submit = function(values)
    {
        g_actualNode.remove(childName);
        DisplayActualNode();
        return true;
    }

    var layer = new Layer("win-layer");
    layer.displayForm(form);
    SetCurrentForm(form);
}

function updateChild(childName)
{
    var child = g_actualNode.getChild(childName);
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
            if (g_actualNode.getChild(name) !== undefined)
                throw g_actualNode.name + " already has a child with name: '" + name +"'";
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

function createChild()
{
    var variables = g_context.entityFactory.listTypenames();
    var form = new Form("Create new child");
    var options = {};
    for (var i = 0; i < variables.length; ++i)
    {
        options[variables[i]] = variables[i];
    }
    var selector = new RadioFormField("Type", "type", options);
    //selector.setAttribute("onclick", "alert(\"hiuhi\");");
    form.addInput(selector);

    var layer = new Layer("win-layer");
    SetCurrentForm(form); // set on g_context

    form.submit = function(values)
    {
       createChildEntity(this.inputs["type"].value);
    }

    layer.displayForm(form);

    return;
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
        if (g_actualNode.getChild(name) !== undefined)
            throw g_actualNode.name + " already has a leaf with name: '" + name +"'";


        for (var key in this.inputs)
        {
            entity[key] = this.inputs[key].value;
        }

        g_actualNode.add(entity);
        //refresh
        DisplayActualNode();

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
    var index = g_actualNode.getChildIndex(childName);
    if (index <= 0)
        return false;


    children = g_actualNode.children;
    var swapWith = index - 1;
    children[index] = children.splice(swapWith, 1, children[index])[0];
    DisplayActualNode();

    return true;
}

function moveDownChild(childName)
{
    g_logger.debug("moveDownChild()");
    // check whether is it the last
    var index = g_actualNode.getChildIndex(childName);
    if (index == -1 || index >= g_actualNode.children.length - 1)
        return false;


    children = g_actualNode.children;
    var swapWith = index + 1;
    children[index] = children.splice(swapWith, 1, children[index])[0];
    DisplayActualNode();

    return true;
}

function generateNodeOutput()
{

    var win = new Window(g_actualNode.name + " output");
    var field = new TextFormField("JSON output", "output", g_actualNode.generateOutput());
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

        if (g_actualNode.getChild(name) !== undefined)
            throw g_actualNode.name + " already has a leaf with name: '" + name +"'";

        g_actualNode.add(node);
        //refresh
        DisplayActualNode();

        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);

    SetCurrentForm(form); // set on g_context
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
        return actionLink("create child", "createChild()")
        + actionLink("output", "generateNodeOutput()")
        + actionLink("load children", "loadNode()");
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
        "logLevel":"info"
    }
}
function LoadGlobalConfig(ctx, filename)
{
    var fh = new FileHandler(filename);
    fh.setCallback(function(configString)
    {
        ctx.setConfig(getDefaultConfig());
        g_logger.info("load global config");

        var input = "{" + configString + "}";
        var config = JSON.parse(input);
        for (var propertyName in config)
            g_logger.debug(" config: " + propertyName + " : " + config[propertyName]);

        // TODO validating
        if (true)
        {
            ctx.setConfig(config);
        }
        else
        {
            g_logger.error("could not verify global config");
        }

        Logger.setLogLevel(ctx.config["logLevel"])

        
    });
    fh.read();
}

function Init()
{
    g_logger.info("Init");
    // tree generation
    g_rootNode = GenerateTree();

    g_context = new Context();
    LoadGlobalConfig(g_context, "./global/global.conf");
    g_context.entityFactory.setType("leaf", Leaf);
    g_context.entityFactory.setType("node", Node);
    g_context.entityFactory.setType("text-leaf", TextLeaf);
    g_context.entityFactory.setType("link-leaf", LinkLeaf);
    /*
    g_context.entityFactory.setType("boolean-leaf", BooleanLeaf);
    g_context.entityFactory.setType("enum-leaf", EnumLeaf);
    */

    // actions for tree handling/display
    g_actionList = CreateActionList();

    g_baseArea = document.getElementById("base-area");
    g_actualNode = g_rootNode;
}

function DisplayActualNode()
{
    if (typeof g_baseArea === 'undefined')
        throw "Entity is uninitialized";

    g_baseArea.innerHTML = g_actualNode.display(g_actionList);
}
