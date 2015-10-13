// application

//TODO
function Context()
{
    this.currentForm = undefined;
    this.setCurrentForm = function(form)
    {
        if (!(form instanceof Form))
            throw "setCurrentForm(): not a form!";

        this.currentForm = form;
    }
}

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

    var form = new Form("Update child");
    form.addInput(new FormField("Name", "name", child.name));

    if (child instanceof Leaf)
        form.addInput(new FormField("Value", "value", child.content));

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
            child.content = this.inputs["value"].value;
            

        DisplayActualNode();
        return true;
    }

    var layer = new Layer("win-layer");
    layer.displayForm(form);
    SetCurrentForm(form);
}



function createChildNode()
{
    var form = new Form("Create new children");
    form.addInput(new FormField("Node name", "name"));
    form.submit = function (values)
    {
        var name = this.inputs["name"].value;

        if (name.length === 0)
            return false;

        if (actualNode.getChild(name) !== undefined)
            throw actualNode.name + " already has a child with name: '" + name +"'";

        actualNode.add(new Node(name));
        //refresh
        DisplayActualNode();

        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);
    SetCurrentForm(form); // set on context
}

function createChildLeaf()
{
    var form = new Form("Create new leaf");
    form.addInput(new FormField("Name", "name"));
    form.addInput(new FormField("Value", "value"));
    form.submit = function (values)
    {
        var name = this.inputs["name"].value;
        var value = this.inputs["value"].value;

        if (name.length === 0)
            return false;

        if (actualNode.getChild(name) !== undefined)
            throw actualNode.name + " already has a leaf with name: '" + name +"'";

        actualNode.add(new Leaf(name, value));
        //refresh
        DisplayActualNode();

        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);

    SetCurrentForm(form); // set on context
}

function generateNodeOutput()
{

    var win = new Window(actualNode.name + " output");
    win.setContent("<textarea>" + actualNode.generateOutput() + "</textarea>");

    var layer = new Layer("win-layer");
    layer.displayWindow(win);
}

function loadNode()
{
    var form = new Form("Load node from user");
    form.addInput(new FormField("JSON input", "json"));
    form.submit = function (values)
    {
        var json = this.inputs["json"].value;

        var node = createTreeFromString(json);

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
        var constNode = new Node("const");
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

        return "<a class='action' onclick='goToBase()'>" + node.base.name + "</a>";
    });

    actions.set("go-to-child", function(node)
    {
        return "<a class='action' onclick='goToChild(\"" + node.name + "\")'>go</a>";
    });

    actions.set("node-actions", function(node)
    {
        return "<a class=\"action\" onclick=\"createChildNode()\">create node</a> "
        + "<a class=\"action\" onclick=\"createChildLeaf()\">create leaf</a> "
        + "<a class=\"action\" onclick=\"generateNodeOutput()\">output</a> "
        + "<a class=\"action\" onclick=\"loadNode()\">load children</a> "
        ;
    });

    actions.set("child-modify", function(child)
    {
        return "<a class='action' onclick='updateChild(\"" + child.name + "\")'>update</a>"
            + "<a class='action' onclick='deleteChild(\"" + child.name + "\")'>remove</a>";
    });

    return actions;
}

function Init()
{
    console.log("makao::Init()");
    // tree generation
    rootNode = GenerateTree();
    
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
