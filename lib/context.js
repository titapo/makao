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
    this.model = new Model("M");
    this.tree = new TreeService(rootNode);
    this.model.addService(this.tree);
    this.view = new View('main', this.model, new Path([]));
    this.model.attach('view', this.view);
    var feedbacker = undefined;
    var storages = {};
    var activeStorageId = "";

    this.setFeedback = function(displayer)
    {
        feedbacker = new Feedback(displayer);
    }
    this.feedback = function(message, level = FeedbackLevel.Normal)
    {
       if (!(feedbacker instanceof Feedback)) 
       {
           logger.warning("feedback does not set");
           return;
       }

       feedbacker.addMessage(message, level);
    }

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
        try
        {
            var storage = this.getActiveStorage();
            //this.feedback(storage.path.display());
            var node = this.tree.getEntity(storage.path);
            storage.storeNode(node);
        }
        catch (e)
        {
            this.feedback(e);
        }
    }

    this.load = function()
    {
        var s = this.getActiveStorage();
        if (s.isEmpty())
        {
            logger.info("storage is empty");
            this.feedback("Storage is empty")
            return; // nothing to do
        }

        s.loadNode(this.tree);
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
        try
        {
            logger.info("Config changed");
            if (this.config['storages'] !== undefined)
                this.processStorages(this.config.storages);

            if (this.config['default_storage'] !== undefined)
            {
                var def = this.config['default_storage'];
                logger.info("ds:" + def);
                if (Object.keys(storages).indexOf(def) === -1)
                    throw "default_storage is unknown (" + def + ")";

                activeStorageId = def;
            }
        }
        catch(e)
        {
            this.feedback("Error during config process:" + e);
        }
    }

    // @private
    this.processStorages = function(storageDict)
    {
        logger.info("process storages");
        for (var name in storageDict)
        {
            storageConf = storageDict[name];

            if (storageConf.target === undefined)
                this.configError('storage[' + name + '].target not defined!');


            logger.info("process storage: " + name + " (" + storageConf.type + ")");
            storages[name] = {}
            switch (storageConf.type)
            {
                case "browser-local":
                    storages[name].storage = new BrowserStorage(
                            storageConf.target,
                            this.entityFactory);
                    break;
                case "plain":
                    storages[name].storage = new PlainStorage(
                            this.entityFactory);
                    break;
                default:
                    logger.error("invalid storage type: " + storageConf.type + " at " + name)
            }
            var p = new Path();
            if (storageConf.path !== undefined)
                p = new Path(storageConf.path);

            storages[name].storage.path = p;
            storages[name].path = p;
            storages[name].type = storageConf.type;
            if (storageConf.path !== undefined)
            {
                storages[name].path = new Path(storageConf.path);
            }
            activeStorageId = name;
            if (storageConf["auto_load"] === "true")
                storages[name].storage.loadNode(this.tree);
        }
    }

}

