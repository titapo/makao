/**
 * Base class for tree storages
 **/

/*
function StorageBase()
{
    StoreTree(tree)
    {
    }

    LoadTree()
}
*/

function BrowserStorage(storageTarget, entityFactory)
{
    var logger = new Logger("storage[" + storageTarget + "]");
    if (typeof(Storage) === undefined)
    {
        logger.error("Storage is not supported in this browser");
        throw "Storage is not supported in this browser";
    }
    logger.info("created");
    var target = storageTarget;
    var factory = entityFactory;

    this.storeNode = function(node)
    {
        logger.info("store node");
        localStorage.setItem(target, node.generateOutput());
    }

    this.loadNode = function()
    {
        logger.info("load node");
        return createTreeFromString(localStorage.getItem(target), factory);
    }

    this.reset = function()
    {
        logger.info("reset storage");
        localStorage.removeItem(target);
    }
}
