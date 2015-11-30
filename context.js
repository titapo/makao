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
    var storages = {};
    var activeStorageId = "";

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
        return Object.keys(storages).length > 0;
    }

    this.getActiveStorageHandler = function()
    {
        if (!this.hasStorage())
            throw "NO STORAGE";

        return storages[activeStorageId];
    }
    this.getActiveStorage = function()
    {
        return this.getActiveStorageHandler().storage;
    }

    this.store = function()
    {
        var node = this.view.getCurrentNode();
        this.getActiveStorage().storeNode(node);
    }

    this.load = function()
    {
        var s = this.getActiveStorage();
        if (s.isEmpty())
        {
            logger.info("storage is empty");
            return; // nothing to do
        }

        var node = s.loadNode();
        this.view.loadChild(node)
    }
    this.clearStorage = function()
    {
        this.getActiveStorage().reset();
    }

    this.getStorageName = function()
    {
        return activeStorageId;
    }

    this.getStoragePath = function()
    {
        return this.getActiveStorageHandler().path;
    }

    this.getStorageDict = function()
    {
        return storages;
    }
    this.selectStorage = function(name)
    {
        if (storages[name] === undefined)
            throw 'there is no storage by name:' + name;

        activeStorageId = name;
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
        if (this.config['storages'] !== undefined)
            this.processStorages(this.config.storages);
    }

    // @private
    this.processStorages = function(storageDict)
    {
        logger.info("-------- procStor");
        for (var name in storageDict)
        {
            storageConf = storageDict[name];
            if (storageConf.type !== 'browser-local')
                continue;

            if (storageConf.target === undefined)
                this.configError('storage[' + name + '].target not defined!');


            logger.info("-------- procStor : " + name);
            storages[name] = {}
            storages[name].storage = new BrowserStorage(storageConf.target, this.entityFactory);
            storages[name].path = new Path();
            if (storageConf.path !== undefined)
            {
                storages[name].path = new Path(storageConf.path);
            }
            activeStorageId = name;
        }
    }

}

