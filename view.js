/**
 */

function View(baseNode, path)
{
    var logger = new Logger("view");
    this.base = baseNode;
    this.path = path;
    this.current = path.navigate(baseNode);
    var area = null;
    var actionList = null;
    this.init = function(p_area/*layer?*/, p_actionList)
    {
        area = p_area;
        actionList = p_actionList;
        logger.info("View initialized.");
    }

    this.display = function()
    {
        if (area === null || actionList === null)
        {
            logger.error("View has not been initialized!");
            throw "View has not been initialized!";
        }
        logger.info("display");
        area.innerHTML = this.current.display(actionList)
    }

    this.goTo = function(node)
    {
        if (!(node instanceof Node))
        {
            logger.error("given parameter is not a node");
            this.x = node;
            throw "goTo(): given parameter is not a node!";
        }
        logger.info("goTo:" + node.name);

        this.current = node;
        this.display();
    }

    this.goToBase = function()
    {
        if (this.current == this.base)
        {
            logger.error("already on top");
            throw "already on top";
        }

        this.path.clear();
        this.goTo(this.base);
    }

    this.goUp = function()
    {
        if (this.current == this.base)
        {
            logger.error("already on top");
            throw "already on top";
        }
        this.path.up();
        this.goTo(this.current.base);
    }

    this.goToChild = function(childName)
    {
        this.path.to(childName);
        this.goTo(this.current.getChild(childName));
    }

    // FIXME should not give it out
    this.getCurrentNode = function()
    {
        return this.current;
    }

    this.loadChild = function(node)
    {
        if (this.current.getChild(node.name) !== undefined)
            throw this.current.name + " already has a leaf with name: '" + node.name +"'";

        this.current.add(node);

        //refresh
        this.display();
    }

}
