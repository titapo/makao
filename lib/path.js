
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

    this.to = function(element)
    {
        pathList.push(element);
    }

    this.up = function()
    {
        return pathList.pop();
    }

    this.clear = function()
    {
        return pathList = [];
    }

    this.navigate = function(initialNode)
    {
        return this.process(function(){}, initialNode)
        /*
        var actual = initialNode;
        for (var i = 0; i < pathList.length ; ++i)
            actual = actual.getChild(pathList[i]);

        return actual;
        */
    }
    this.assuredNavigate = function(initialNode)
    {
        console.info(initialNode);
        var actual = initialNode;
        for (var i = 0; i < pathList.length ; ++i)
        {
            console.info(actual);
            var next = actual.getChild(pathList[i]);
            if (next === undefined)
            {
                n = new Node(pathList[i]);
                actual.add(n);
                next = n;
            }
            actual = next;
        }
        return actual;
    }

    this.process = function(processor, initialNode)
    {
        var actual = initialNode;
        for (var i = 0; i < pathList.length ; ++i)
        {
            actual = actual.getChild(pathList[i]);
            if (actual === undefined)
                throw "'" + pathList[i] + "' entity does not exists in '" + this.display() + "'!";

            processor(actual);
        }
        return actual;
    }

    this.display = function()
    {
        return pathList.join(" / ");
    }
}
