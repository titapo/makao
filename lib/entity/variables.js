/* derived objects from leaf and node */

class LinkLeaf extends Leaf
{
    static create(name, content)
    {
        return new LinkLeaf(name, content);
    }
    constructor(name, content)
    {
        super(name, content, "link-leaf");
    }

    displayBrief(actions = null)
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

class EnumLeaf extends Leaf
{
    static create(name, options = [""]/*?*/, value = "")
    {
        return new EnumLeaf(name, options, value);
    }

    constructor(name, options = [""]/*?*/, value = "")
    {
        if (!(options instanceof Array))
            throw "EnumLeaf() expects Array as option";

        this.options = options;

        if (this.options.indexOf(value) === -1)
            throw "EnumLeaf() '" + value + "' is invalid";

        super(name, value, "enum-leaf");
    }
}

class TextLeaf extends Leaf
{
    static create(name, content)
    {
        return new TextLeaf(name, content);
    }
    constructor(name, content)
    {
        super(name, content, "text-leaf");
    }

    displayBrief(actions)
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

    createForm(title)
    {
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        form.addInput(new TextFormField("Value", "content", this.content));
        return form;
    }
}

class BooleanLeaf extends Leaf
{
    static create(name, content = false)
    {
        return new BooleanLeaf(name, content);
    }

    constructor(name, content = false)
    {
        if (typeof(content) !== "boolean")
            throw "BooleanLeaf() expects boolean as content";

        super(name, content, "bool-leaf");
    }

    createForm(title)
    {
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        form.addInput(new BooleanFormField("Value", "content", this.content));
        return form;
    }
}
