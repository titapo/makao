// helpers

function listTagAttributes(attributes)
{
    var output = "";
    for (var key in attributes)
    {
        output += key + '="' + attributes[key]+ '" ';
    }
    return output + " ";
}

function Tag(name, content, attributes)
{
    return "<" + name + " " + listTagAttributes(attributes) + ">" + content + "</" + name + ">";
}
function SimpleTag(name, attributes)
{
    return "<" + name + " " + listTagAttributes(attributes) + " />";
}

function ActionButton(title, action)
{
    return Tag("a", title, {"class":"action", "onclick":action});
}
