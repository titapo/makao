// Node
class Node extends Entity
{
    static create(name)
    {
        return new Node(name);
    }

    constructor(name, type = "node", base = 0)
    {
        super(name, type, base);
        this.children = Array();
        this.logger.debug("create Node(" + name + ", " + type + ")");
    }

    displayBrief(actions)
    {
        return {
            name: this.name,
            type: this.type,
            instance: this,
            actions: ["go-to-child", "child-modify"]
        }
    }

    display(actions)
    {
        // TODO separate view!
        // debug("Node.display() name:" + this.name);

        let result = {
            name: this.name,
            type: this.type,
            instance: this,
            content: []
        };
        if (this.base instanceof Node)
        {
            result.topactions = ["base-link"]
        }

        result.actions = ["node-action-creation", "storage-actions"];

        for (let child of this.children)
        {
            var childContent = child.displayBrief(actions);
            if (typeof childContent === 'object')
            {
                result.content.push(childContent);
            }
            else
                throw "FATAL:" + childContent;
        }

        return result;
    }

    add(node)
    {
        if (!(node instanceof Entity))
            throw "Node.add(): invalid type ";

        this.children.push(node);
        node.base = this;
    }

    remove(nodeName)
    {
        var index = this.getChildIndex(nodeName);
        if (index < 0)
        {
            logger.info("Node.remove('" + nodeName + "'): no such child");
            throw "ERROR";
        }

        this.children.splice(index, 1);
    }

    getChild(name)
    {
        for (let child of this.children)
        {
            if (child.name === name)
                return child;
        }
    }

    getChildIndex(name)
    {
        for (let i = 0; i < this.children.length; ++i)
        {
            let child = this.children[i];
            if (child.name === name)
                return i;
        }
        return -1;
    }

    moveUpChild(childName)
    {
        var index = this.getChildIndex(childName);
        if (index <= 0)
            return false;

        var swapWith = index - 1;
        this.children[index] = this.children.splice(swapWith, 1, this.children[index])[0];
    }

    moveDownChild(childName)
    {
        var index = this.getChildIndex(childName);
        if (index == -1 || index >= this.children.length - 1)
            return false;

        var swapWith = index + 1;
        this.children[index] = this.children.splice(swapWith, 1, this.children[index])[0];
    }

    generateOutput()
    {
        var attributes = ""
        for (var key in this)
        {
            if (key === "base" || key === "children"
                || typeof(this[key]) === "function")
                continue;

            if (attributes.length > 0)
                attributes += ",";

            attributes += '"' + key + '":"' + this[key]+ '"';
        }

        var childList = "";
        for (let child of this.children.length)
        {
            if (childList.length > 0)
                childList += ",";

            childList += child.generateOutput();
        }

        if (attributes.length > 0)
            attributes += ",";

        attributes += '"children":[' + childList + ']';

        return '{' + attributes + '}';
    }

    clone()
    {
        var node = new Node(this.name, this.type, this.base);
        for (let child of this.children)
        {
            node.add(child.clone())
        }

        return node;
    }

    createForm(title)
    {
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        return form;
    }
}
