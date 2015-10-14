/* derived objects from leaf and node */

function LinkLeaf(name, content)
{
    Leaf.call(this, name, content, "link-leaf");
    this.displayBrief = function(actions = null)
    {
        return "<a target='_blank' href='" + this.content + "'>" + this.name + "</a> "
            + (actions?actions.execute("child-modify", this):"");
    }
}

function EnumLeaf(name, options/*?*/, value)
{
    if (!(options instanceof Array))
        throw "EnumLeaf() expects Array as option";

    this.options = options;

    if (this.options.indexOf(value) === -1)
        throw "EnumLeaf() '" + value + "' is invalid";

    Leaf.call(this, name, value, "enum-leaf");
}
EnumLeaf.prototype = Object.create(Leaf.prototype);
