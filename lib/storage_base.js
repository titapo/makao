/**
 * Base class for tree storages
 **/

class StorageBase
{
    constructor(factory, path = undefined)
    {
        this.logger = new Logger("storage");
        this.factory = factory;
        this.logger.debug("created");
        this.path = new Path();
        this.type = "storage-base";
        if (path !== undefined)
            this.path = path;
    }

    loadNode(tree)
    {
        throw "not implemented";
    }
}

class BrowserStorage extends StorageBase
{
    constructor(storageTarget, factory, path)
    {
        super(factory, path);
        if (typeof(Storage) === undefined)
        {
            this.logger.error("Storage is not supported in this browser");
            throw "Storage is not supported in this browser";
        }
        this.target = storageTarget;
        this.type = "browser-local";
    }

    storeNode(node)
    {
        this.logger.info("store node");
        localStorage.setItem(this.target, node.generateOutput());
    }

    getStoredNode()
    {
        return createTreeFromString(localStorage.getItem(this.target), this.factory);
    }

    loadNode(tree)
    {
        this.logger.info("load node");
        var node = this.getStoredNode()
        tree.loadChild(node, this.path);
    }

    reset()
    {
        this.logger.info("reset storage");
        localStorage.removeItem(this.target);
    }

    isEmpty()
    {
        return localStorage.getItem(this.target) === null || localStorage.getItem(this.target).length === 0;
    }
}

class PlainStorage extends StorageBase
{
    constructor(factory, path)
    {
        super(factory, path);
        this.type = "plain";
    }

    reset()
    {}

    loadNode(tree)
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

    storeNode(node)
    {
        var win = new Window(node.name + " output");
        var field = new TextFormField("JSON output", "output", node.generateOutput());
        win.setContent(field.display());

        var layer = new Layer("win-layer");
        layer.displayWindow(win);
    }

    isEmpty()
    {
        return false;
    }
}


