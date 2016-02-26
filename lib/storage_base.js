/**
 * Base class for tree storages
 **/

function StorageBase(factory)
{
    this._init(factory)
}

StorageBase.prototype = {
    factory: null,
    logger: null,
    path: new Path(),
    _init: function(factory)
    {
        this.logger = new Logger("storage");
        this.factory = factory;
        this.logger.debug("created");
    },
    loadNode: function(tree)
    {}
}

BrowserStorage.prototype = Object.create(StorageBase.prototype);
BrowserStorage.prototype.constructor = BrowserStorage;

function BrowserStorage(storageTarget, factory)
{
    this._init(factory);
    if (typeof(Storage) === undefined)
    {
        this.logger.error("Storage is not supported in this browser");
        throw "Storage is not supported in this browser";
    }
    this.target = storageTarget;
}

BrowserStorage.prototype.logger = null;
BrowserStorage.prototype.target = null; // ? TODO

BrowserStorage.prototype.storeNode = function(node)
{
    this.logger.info("store node");
    localStorage.setItem(this.target, node.generateOutput());
}

BrowserStorage.prototype.loadNode = function(tree)
{
    this.logger.info("load node");
    var node = createTreeFromString(localStorage.getItem(this.target), this.factory);
    tree.loadChild(node, this.path);
}

BrowserStorage.prototype.reset = function()
{
    this.logger.info("reset storage");
    localStorage.removeItem(this.target);
}

BrowserStorage.prototype.isEmpty = function()
{
    return localStorage.getItem(this.target) === null || localStorage.getItem(this.target).length === 0;
}

function PlainStorage(factory)
{
    this._init(factory);
}

PlainStorage.prototype = Object.create(StorageBase.prototype);
PlainStorage.prototype.constructor = PlainStorage;

PlainStorage.prototype.reset = function()
{}

PlainStorage.prototype.loadNode = function(tree)
{
    var form = new Form("load node from text");
    form.addInput(new TextFormField("JSON input", "json"));
    var _this = this;
    form.submit = function (values)
    {
        console.log(_this.factory);
        var json = this.inputs["json"].value;
        var node = createTreeFromString(json, _this.factory);
        tree.loadChild(node, this.path);
        return true;
    };

    var layer = new Layer("win-layer");
    layer.displayForm(form);
    SetCurrentForm(form); // set on g_context
}

PlainStorage.prototype.storeNode = function(node)
{
    var win = new Window(node.name + " output");
    var field = new TextFormField("JSON output", "output", node.generateOutput());
    win.setContent(field.display());

    var layer = new Layer("win-layer");
    layer.displayWindow(win);
}

PlainStorage.prototype.isEmpty = function()
{
    return false;
}
