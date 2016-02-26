
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
