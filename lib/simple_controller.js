/**
 * Simple controller for view
 */
class SimpleController extends Controller
{
    constructor(name, model, view)
    {
        super(name, model, view);
        this.logger = new Logger(name);
        this.actions = {};
        this._initializeActions();
    }

    _initializeActions()
    {
        this.actions["node-action-creation"] = new Action(new Callback(this, this.createChild));
        this.actions["go-to-child"] = new Action(new Callback(this, this.goToChild));
        this.actions["go-to"] = new Action(new Callback(this, this.goTo));
        this.actions["update"] = new Action(new Callback(this, this.modifyChild));
        this.actions["remove"] = new Action(new Callback(this, this.removeChild));
        this.actions["move-up"] = new Action(new Callback(this, this.moveUpChild));
        this.actions["move-down"] = new Action(new Callback(this, this.moveDownChild));
        this.actions["create-view"] = new Action(new Callback(this, this.createView));
    }

    createChild(typename)
    {
        this.logger.debug("Create child:" + typename)
            var entity = g_context.entityFactory.create(typename);
        var form = entity.createForm("Create new " + typename + " child");
        var _this = this;
        form.submit = function(values)
        {
            return _this.model.getService("tree").addChild(_this.view.getPath(), entity, values);
        };
        var layer = new Layer("win-layer");
        layer.displayForm(form);

        SetCurrentForm(form); // set on g_context
    }

    getAction(name)
    {
        if (this.actions[name] === undefined)
            throw name + " refers for undefined action in controller";

        return this.actions[name];
    }

    goToChild(child)
    {
        this.logger.debug("Go to child: " + child);
        this.view.goToChild(child);
    }

    goTo(encodedPath)
    {
        this.logger.info("Go to: " + encodedPath);
        let path = Path.decode(encodedPath);
        this.logger.debug("Go to: " + path.display());
        this.view.updatePath(path);
    }

    modifyChild(child)
    {
        this.logger.debug("Modify child:" + child);
        var path = new Path([this.view.getPath(), child]);
        var entity = this.model.getService("tree").getEntity(path);
        var form = entity.createForm("Update child");
        var _this = this;
        form.submit = function(values)
        {
            return _this.model.getService("tree").updateChild(_this.view.getPath(), child, values);
        }
        var layer = new Layer("win-layer");
        layer.displayForm(form);
        SetCurrentForm(form);
    }

    removeChild(child)
    {
        this.logger.debug("Remove child:" + child);
        var path = new Path([this.view.getPath(), child]);
        var form = new Form("Remove child");
        var _this = this;
        form.submit = function(values)
        {
            return _this.model.getService("tree").removeChild(_this.view.getPath(), child);
        }
        var layer = new Layer("win-layer");
        layer.displayForm(form);
        SetCurrentForm(form);
    }

    moveUpChild(child)
    {
        this.logger.debug("Move up child:" + child);
        var path = this.view.getPath();
        this.model.getService("tree").moveUpChild(path, child);
    }

    moveDownChild(child)
    {
        this.logger.debug("Move down child:" + child);
        var path = this.view.getPath();
        this.model.getService("tree").moveDownChild(path, child);
    }

    createView(child)
    {
        this.logger.debug("Create New view for child:" + child);
        let identifier = child; // FIXME view identifier is child name
        let path = new Path([this.view.getPath(), child])
        let entity = this.model.getService("tree").getEntity(path)
        if (!(entity instanceof Node))
            throw entity.name + " is not a node!";

        this.view.createSubView(identifier, path);
    }
}
