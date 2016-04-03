"use strict";
class StorageService extends Service
{
    constructor()
    {
        super("storage");
        this.storages = {};
        this.activeId = "";
        this.logger = new Logger("storage-service");
    }

    hasStorage()
    {
        return Object.keys(this.storages).length > 0;
    }

    setStorage(name, storage)
    {
        this.storages[name] = storage;
        if (this.activeId == "")
            this.activateStorage(name);
    }

    activateStorage(name)
    {
        if (this.storages[name] === undefined)
            throw 'there is no storage by name:' + name;

        this.activeId = name;
    }

    getActiveStorage()
    {
        if (this.storages[this.activeId] === undefined)
            throw "'" + this.activeId + "' is an undefined storage identifier";

        return this.storages[this.activeId].storage;
    }

    /**
     * Stores a tree into storage.
     * It may override previous.
     *
     * Args:
     *     tree (TreeService): tree or sub-tree which will be stored
     */
    store(tree)
    {
        try
        {
            var storage = this.getActiveStorage();
            //this.feedback(storage.path.display());
            var node = tree.getEntity(storage.path);
            storage.storeNode(node);
        }
        catch (e)
        {
            this.logger.error(e);
            //.feedback(e);
        }
    }

    /**
     */
    clear()
    {
        let storage = this.getActiveStorage();
        storage.reset()
    }

    /**
     * Returns:
     *     list of storage names
     */
    getStorageNames()
    {
        return Object.keys(this.storages);
    }

    /**
     * Loads stored data to tree
     *
     * Args:
     *     tree (TreeService): tree or sub-tree in which stored data will be loaded
     */
    loadToTree(tree)
    {
        var storage = this.getActiveStorage();
        if (storage.isEmpty())
        {
            this.logger.info("storage is empty");
            //this.feedback("Storage is empty") TODO(titapo) write out feedback message
            return;
        }

        storage.loadNode(tree);
    }
}

/*Is that class required? */
class StorageOperationHandler
{
    /**
     * Args:
     *     service: the storage service
     */
    constructor(context)
    {
        this.context = context;
        this.service = context.model.getService("storage");
    }
    store()
    {
        this.context.store();
        this.context.feedback("Data stored to storage");
    }
    load()
    {
        this.context.load();
        this.context.feedback("Data loaded from storage")
    }
    clear()
    {
        this.service.clear();
        this.context.feedback("Storage cleared");
    }
    changeStorage()
    {
        var form = new Form("Change Storage");
        var _this = this;
        form.submit = function(values)
        {
            try
            {
                _this.context.selectStorage(this.inputs['storage'].value);
                DisplayActualNode();
                _this.context.feedback("Storage changed");
                return true;
            }
            catch(err)
            {
                g_logger.error(err.message);
            }
        }
        var storages = this.context.model.getService("storage").getStorageNames();
        var options = {};
        for (var name of storages)
        {
            options[name] = name;
        }
        var selector = new RadioFormField("Storage", "storage", options);
        form.addInput(selector);

        var layer = new Layer("win-layer");
        layer.displayForm(form);
        SetCurrentForm(form);
    }
}
