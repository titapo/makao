/**
 * Tree representation
 */
class TreeService extends Service
{
    constructor(root)
    {
        super("tree");
        this.__init(root);
    }
}
//TreeService.prototype = Object.create(Service.prototype);
//TreeService.prototype.constructor = TreeService;

TreeService.prototype.__init = function(root)
{
    this.root = root;
    this.path = new Path([]);
    this.current = root; // redundant
}

/**
 * Add childen of a node to a node of the tree.
 * param node: childen of it will be added
 * param path: absolute destination path if given, otherwise current position
 */
TreeService.prototype.loadChild = function(node, path)
{
    var target = this.current;
    if (path !== undefined)
    {
        target = path.assuredNavigate(this.root);
    }

    if (target.getChild(node.name) !== undefined)
        throw target.name + " already has a leaf with name: '" + node.name +"'";

    for (var i in node.children)
    {
        var subnode = node.children[i];
        this.logger.info(subnode);
        target.add(subnode);
    }

    this.changed();
}

/**
 * Returns an entity.
 * FIXME client may change the tree state!
 */
TreeService.prototype.getEntity = function(path)
{
    this.logger.debug("getEntity() path:" + path.display())
    return path.navigate(this.root);
}

TreeService.prototype.moveUpChild = function(path, childName)
{
    this.getEntity(path).moveUpChild(childName);
    this.changed();
}

TreeService.prototype.moveDownChild = function(path, childName)
{
    this.getEntity(path).moveDownChild(childName);
    this.changed();
}

TreeService.prototype.addChild = function(path, child, values)
{
    var node = this.getEntity(path);
    var name = values["name"].value;
    if (node.getChild(name) !== undefined)
    {
        var msg = node.name + " already has a child with name: '" + name +"'";
        //g_context.feedback(msg, FeedbackLevel.Error);
        throw msg;
    }
    for (var key in values)
    {
        child[key] = values[key].value;
    }
    node.add(child);
    this.changed();
    return true;
}

TreeService.prototype.updateChild = function(path, childName, values)
{
    var node = this.getEntity(path);
    var child = this.getEntity(new Path([path, childName]));
    this.logger.info("update child: " + child);
    var name = values["name"].value;

    // validate name
    if (name.length === 0)
        return false;

    if (name !== child.name)
    {
        if (node.getChild(name) !== undefined)
        {
            var msg = node.name + " already has a child with name: '" + name +"'";
            //g_context.feedback(msg, FeedbackLevel.Error);
            throw msg;
            // TODO handle exception in form!
        }
    }

    // this should be in entity: ent.update(values) involving validation
    child.name = name;

    if (child instanceof Leaf)
        child.content = values["content"].value;
    else
        this.logger.error("child is not a leaf (" + child.leaf + ")");

    this.changed();
    return true;
}

TreeService.prototype.removeChild = function(path, childName)
{
    this.logger.info("Remove " + path.display() + " x " + childName);
    var node = this.getEntity(path);
    var child = this.getEntity(new Path([path, childName]));
    node.remove(childName);
    //TODO .feedback("'" + childName + "' removed");
    this.changed();
    return true;
}
