/**
 * this class contains contextual variables and methods
 * TODO 
 */
function Context(rootNode)
{
    var logger = new Logger("context");
    this.entityFactory = new EntityFactory();
    this.currentForm = undefined;
    this.config = {}; // default config
    this.view = new View(rootNode, new Path([]));
    var storage = null;

    this.setCurrentForm = function(form)
    {
        if (!(form instanceof Form))
            throw "setCurrentForm(): not a form!";

        this.currentForm = form;
    }

    this.setConfig = function(config)
    {
        this.config = config;
        this.refreshConfig();
    }

    /**
     * merges new config into existing, overrides
     */
    this.overrideConfig = function(config)
    {
        for (var attr in config)
        {
            this.config[attr] = config[attr];
        }

        this.refreshConfig();
    }

    this.hasStorage = function()
    {
        return storage !== null;

    }

    this.store = function()
    {
        if (!this.hasStorage())
            throw "NO STORAGE";

        var node = this.view.getCurrentNode();
        storage.storeNode(node);
    }

    this.load = function()
    {
        if (!this.hasStorage())
            throw "NO STORAGE";

        var node = storage.loadNode();
        this.view.loadChild(node)
    }
    this.clearStorage = function()
    {
        storage.reset();
    }

    // @private
    this.configError = function(msg)
    {
        logger.error(msg);
        throw "invalid config:" + msg;
    }

    // @private
    this.refreshConfig = function()
    {
        logger.info("Config changed");
        if (this.config['storage'] !== undefined)
        {
            if (this.config['storage']['type'] === 'browser-local')
            {
                if (this.config['storage']['name'] === undefined)
                    this.configError('storage.name not defined!');

                storage = new BrowserStorage(this.config['storage']['name'], this.entityFactory);
            }
        }
    }

}

