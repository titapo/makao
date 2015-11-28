

function Menu(name, displayer)
{
    var title = name;
    var elements = {};

    this.addElement = function(title, action = '')
    {
        elements[title] = {};
        elements[title].action = action;
    }
    this.addStaticField = function(title, content)
    {
        elements[title] = {};
        elements[title].content = content;
    }

    this.display = function()
    {
        return displayer(title, elements);
    }
}

function default_menu(title, elements)
{
    var elemOut = '';
    for (var name in elements)
    {
        if (elements[name].action === undefined)
            elemOut += Tag('li', Tag('p', elements[name].content, {'class':'static'}));
        else
            elemOut += Tag('li', Tag('a', name, {'class':'action','onclick':elements[name].action}));
    }
    return Tag('div',
            Tag('a', title, {'class':'action'}) + Tag('ul', elemOut),
            {'class':'menu'});
}
