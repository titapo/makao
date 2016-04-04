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
    this.model.addService(new StorageService());
    this.view = new View('main', this.model, new Path([]))
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
        return this.model.getService("storage").hasStorage();
        //return Object.keys(storages).length > 0;
    }

    this.getActiveStorage = function()
    {
        return this.model.getService("storage").getActiveStorage();

        if (!this.hasStorage())
            throw "NO STORAGE";

        return storages[activeStorageId].storage;
    }

    this.store = function()
    {
        this.model.getService("storage").store(this.model.getService("tree"));
    }

    this.load = function()
    {
        this.model.getService("storage").loadToTree(this.tree);
    }
    this.clearStorage = function()
    {
        this.model.getService("storage").getActiveStorage().reset();
    }

    this.getStorageName = function()
    {
        return this.model.getService("storage").activeId;
    }

    this.selectStorage = function(name)
    {
        this.model.getService("storage").activateStorage(name);
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
            this.logger.debug(e.stack);
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
            storages[name] = {}; // storage descriptor
            var path = new Path();
            if (storageConf.path !== undefined)
                path = new Path(storageConf.path);

            switch (storageConf.type)
            {
                case "browser-local":
                    storages[name].storage = new BrowserStorage(
                            storageConf.target,
                            this.entityFactory,
                            path);
                    break;
                case "plain":
                    storages[name].storage = new PlainStorage(
                            this.entityFactory, path);
                    break;
                default:
                    logger.error("invalid storage type: " + storageConf.type + " at " + name)
            }

            this.model.getService("storage").setStorage(name, storages[name]);

            //storages[name].path = path;
            activeStorageId = name;
            if (storageConf["auto_load"] === "true")
                storages[name].storage.loadNode(this.tree);
        }
    }

}

