
function Path(path)
{

    var pathList = [];
    for (var index in path)
    {
        if (path[index] instanceof Path)
            pathList = pathList.concat(path[index].get());
        else
            pathList.push(path[index]);
    }

    this.get = function()
    {
        return pathList;
    }

    this.navigate = function(initialNode)
    {
        var actual = initialNode;
        for (var i = 0; i < pathList.length ; ++i)
            actual = actual.getChild(pathList[i]);

        return actual;
    }

    this.process = function(processor, initialNode)
    {
        var actual = initialNode;
        for (var i = 0; i < pathList.length ; ++i)
        {
            actual = actual.getChild(pathList[i]);
            processor(actual);
        }

    }

    this.display = function()
    {
        return pathList.join(" / ");
    }
}
