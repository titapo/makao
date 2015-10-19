// application

//TODO
function Context()
{
    this.entityFactory = new EntityFactory();
    this.currentForm = undefined;

    this.setCurrentForm = function(form)
    {
        if (!(form instanceof Form))
            throw "setCurrentForm(): not a form!";

        this.currentForm = form;
    }
}

var context;
var rootNode;
var actualNode;
var globalActionList;
var baseArea;

function goToNode(node)
{
    if (!(node instanceof Node))
        throw "goToNode(): not a node!";

    actualNode = node;
    DisplayActualNode();
}

function goToBase()
{
    goToNode(actualNode.base);
}

function goToChild(childName)
{
    var node = actualNode.getChild(childName);
    goToNode(node);
}

function deleteChild(childName)
{
    var child = actualNode.getChild(childName);
    if (child === undefined)
        throw "Child '" + childName + "' does not exist!";

    var form = new Form("Delete child");
    form.submit = function(values)
    {
        actualNode.remove(childName);
        DisplayActualNode();
        return true;
    }

    var layer = new Layer("win-layer");
    layer.displayForm(form);
    SetCurrentForm(form);
}

function updateChild(childName)
{
    var child = actualNode.getChild(childName);
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
            if (actualNode.getChild(name) !== undefined)
                throw actualNode.name + " already has a child with name: '" + name +"'";
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
    var variables = context.entityFactory.listTypenames();
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
    SetCurrentForm(form); // set on context

    form.submit = function(values)
    {
       createChildEntity(this.inputs["type"].value);
    }

    layer.displayForm(form);

    return;
}

function createChildEntity(identifier)
{
    var entity = context.entityFactory.create(identifier);
    var form = entity.createForm("Create new " + identifier);
    form.submit = function()
    {
        var name = this.inputs["name"].value;
        /*
         * TODO validation
        if (name.length === 0)
            return false;
            */
        if (actualNode.getChild(name) !== undefined)
            throw actualNode.name + " already has a leaf with name: '" + name +"'";


        for (var key in this.inputs)
        {
            entity[key] = this.inputs[key].value;
        }

        actualNode.add(entity);
        //refresh
        DisplayActualNode();

        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);

    SetCurrentForm(form); // set on context
}

function moveUpChild(childName)
{
    console.log("moveUpChild()");
    // check whether is it the first
    var index = actualNode.getChildIndex(childName);
    if (index <= 0)
        return false;


    children = actualNode.children;
    var swapWith = index - 1;
    children[index] = children.splice(swapWith, 1, children[index])[0];
    DisplayActualNode();

    return true;
}

function moveDownChild(childName)
{
    console.log("moveDownChild()");
    // check whether is it the last
    var index = actualNode.getChildIndex(childName);
    if (index == -1 || index >= actualNode.children.length - 1)
        return false;


    children = actualNode.children;
    var swapWith = index + 1;
    children[index] = children.splice(swapWith, 1, children[index])[0];
    DisplayActualNode();

    return true;
}

function generateNodeOutput()
{

    var win = new Window(actualNode.name + " output");
    var field = new TextFormField("JSON output", "output", actualNode.generateOutput());
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

        var node = createTreeFromString(json, context.entityFactory);

        if (actualNode.getChild(name) !== undefined)
            throw actualNode.name + " already has a leaf with name: '" + name +"'";

        actualNode.add(node);
        //refresh
        DisplayActualNode();

        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);

    SetCurrentForm(form); // set on context
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
        console.log("actionLink: " +  title + " > " + action);
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

function Init()
{
    console.log("makao::Init()");
    // tree generation
    rootNode = GenerateTree();
    context = new Context();
    context.entityFactory.setType("leaf", Leaf);
    context.entityFactory.setType("node", Node);
    context.entityFactory.setType("text-leaf", TextLeaf);
    context.entityFactory.setType("link-leaf", LinkLeaf);
    /*
    context.entityFactory.setType("boolean-leaf", BooleanLeaf);
    context.entityFactory.setType("enum-leaf", EnumLeaf);
    */

    // actions for tree handling/display
    globalActionList = CreateActionList();

    baseArea = document.getElementById("base-area");
    actualNode = rootNode;
}

function DisplayActualNode()
{
    if (typeof baseArea === 'undefined')
        throw "Entity is uninitialized";

    baseArea.innerHTML = actualNode.display(globalActionList);
}
