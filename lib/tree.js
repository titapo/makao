/**
 * Tree representation
 */
function TreeService(root)
{
    this._init("tree");
    this.__init(root);
}
TreeService.prototype = Object.create(Service.prototype);
TreeService.prototype.constructor = TreeService;

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
        console.info(subnode);
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
    return path.navigate(this.root);
}
