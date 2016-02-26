/* derived objects from leaf and node */

function LinkLeaf(name, content)
{
    if (!(this instanceof LinkLeaf))
        return new LinkLeaf(name, content);

    Leaf.call(this, name, content, "link-leaf");
    this.displayBrief = function(actions = null)
    {
        var result = {
            name: this.name,
            type: this.type,
            content: "<a target='_blank' href='" + this.content + "'>" + this.name + "</a> ",
            tooltip: this.type,
            instance: this,
            actions: ['child-modify']
        };
        return result;
    }
}
LinkLeaf.prototype = Object.create(Leaf.prototype);

function EnumLeaf(name, options = [""]/*?*/, value = "")
{
    if (!(this instanceof EnumLeaf))
        return new EnumLeaf(name, options, value);

    if (!(options instanceof Array))
        throw "EnumLeaf() expects Array as option";

    this.options = options;

    if (this.options.indexOf(value) === -1)
        throw "EnumLeaf() '" + value + "' is invalid";

    Leaf.call(this, name, value, "enum-leaf");
}
EnumLeaf.prototype = Object.create(Leaf.prototype);

function TextLeaf(name, content)
{
    if (!(this instanceof TextLeaf))
        return new TextLeaf(name, content);

    Leaf.call(this, name, content, "text-leaf");
    this.displayBrief = function(actions)
    {
        var result = {
            name: this.name,
            type: this.type,
            content: "<p><pre>" + this.content + "</pre></p>",
            tooltip: this.type,
            instance: this,
            actions: ['child-modify']
        };
        return result;
    }

    this.createForm = function(title)
    {
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        form.addInput(new TextFormField("Value", "content", this.content));
        return form;
    }
}
TextLeaf.prototype = Object.create(Leaf.prototype);

function BooleanLeaf(name, content = false)
{
    if (!(this instanceof BooleanLeaf))
        return new BooleanLeaf(name, content);

    if (typeof(content) !== "boolean")
        throw "BooleanLeaf() expects boolean as content";

    Leaf.call(this, name, content, "bool-leaf");

    this.createForm = function(title)
    {
        console.log("XXX: " + typeof(this.content));
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        form.addInput(new BooleanFormField("Value", "content", this.content));
        return form;
    }
}
BooleanLeaf.prototype = Object.create(Leaf.prototype);
