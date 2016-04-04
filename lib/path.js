
class Path
{
    constructor(path)
    {
        this.pathList = [];
        if (path === undefined)
            return;

        for (let element of path)
        {
            if (element instanceof Path)
                this.pathList = this.pathList.concat(element.get());
            else
                this.pathList.push(element);
        }
    }

    get()
    {
        return this.pathList;
    }

    to(element)
    {
        this.pathList.push(element);
    }

    up()
    {
        return this.pathList.pop();
    }

    clear()
    {
        return this.pathList = [];
    }

    isOnTop()
    {
        return this.pathList.length == 0;
    }

    navigate(initialNode)
    {
        return this.process(function(){}, initialNode)
    }
    /**
     * create path if does not exists
     */
    assuredNavigate(initialNode)
    {
        console.info(initialNode);
        var actual = initialNode;
        for (let element of this.pathList)
        {
            console.info(actual);
            var next = actual.getChild(element);
            if (next === undefined)
            {
                let node = new Node(element);
                actual.add(node);
                next = node;
            }
            actual = next;
        }
        return actual;
    }

    /**
     * throws error if path cannot be processed
     * */
    process(processor, initialNode)
    {
        var actual = initialNode;
        for (let element of this.pathList)
        {
            actual = actual.getChild(element);
            if (actual === undefined)
                throw "'" + element + "' entity does not exists in '" + this.display() + "'!";

            processor(actual);
        }
        return actual;
    }

    display()
    {
        return this.pathList.join(" / ");
    }

    static encode(path)
    {
        return encodeURIComponent(JSON.stringify(path.get()));
    }

    static decode(encodedPath)
    {
        return new Path(JSON.parse(decodeURIComponent(encodedPath)))
    }
}
