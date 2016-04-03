
class Leaf extends Entity
{
    static create(name, content)
    {
        return new Leaf(name, content);
    }

    constructor(name, content = "", type = "leaf", base = 0)
    {
        super(name, type, base);
        this.content = content;
        this.logger.debug("create Leaf(" + name + ", " + content + ", " + type + ")");
    }

    display(actions)
    {
        //return this.displayBrief(actions) + " (" + this.type + ")";
        return this.displayBrief(actions);
    }

    displayBrief(actions)
    {
        var result = {
            name: this.name,
            type: this.type,
            content: this.content,
            tooltip: this.type,
            instance: this,
            actions: ['child-modify']
        };
        return result;
    }

    generateOutput()
    {
        var copy = this.clone();
        delete copy.base;

        return JSON.stringify(copy);
    }

    clone()
    {
        return new Leaf(this.name, this.content, this.type, this.base);
    }

    createForm(title)
    {
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        form.addInput(new FormField("Value", "content", this.content));
        return form;
    }
}
