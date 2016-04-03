function SimpleController(name, model, view)
{
    Controller.call(this, name, model, view);
    this.logger = new Logger("ctrl-" + name)
    this.actions = {};
    this.initializeActions();
}

SimpleController.prototype = Object.create(Controller.prototype);
SimpleController.prototype.constructor = SimpleController;

SimpleController.prototype.initializeActions = function()
{
    this.actions["node-action-creation"] = new Action(new Callback(this, this.createChild));
    this.actions["go-to-base"] = new Action(new Callback(this, this.goToBase));
    this.actions["go-to-child"] = new Action(new Callback(this, this.goToChild));
    this.actions["update"] = new Action(new Callback(this, this.modifyChild));
    this.actions["remove"] = new Action(new Callback(this, this.removeChild));
    this.actions["move-up"] = new Action(new Callback(this, this.moveUpChild));
    this.actions["move-down"] = new Action(new Callback(this, this.moveDownChild));
    this.actions["create-view"] = new Action(new Callback(this, this.createView));
}

SimpleController.prototype.createChild = function(typename)
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
SimpleController.prototype.getAction = function(name)
{
    if (this.actions[name] === undefined)
        throw name + " refers for undefined action in controller";

    return this.actions[name];
}

SimpleController.prototype.goToBase = function(child)
{
    this.logger.debug("Go to base: " + child)
    this.view.goUp();
}

SimpleController.prototype.goToChild = function(child)
{
    this.logger.debug("Go to child: " + child);
    this.view.goToChild(child);
}

SimpleController.prototype.modifyChild = function(child)
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


SimpleController.prototype.removeChild = function(child)
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

SimpleController.prototype.moveUpChild = function(child)
{
    this.logger.debug("Move up child:" + child);
    var path = this.view.getPath();
    this.model.getService("tree").moveUpChild(path, child);
}

SimpleController.prototype.moveDownChild = function(child)
{
    this.logger.debug("Move down child:" + child);
    var path = this.view.getPath();
    this.model.getService("tree").moveDownChild(path, child);
}

SimpleController.prototype.createView = function(child)
{
    this.logger.debug("Create New view for child:" + child);
    var identifier = child; // FIXME view identifier is child name
    this.view.createSubView(child, new Path([this.view.getPath(), child]));
}

