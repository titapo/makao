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
    var target = storageTarget;
    var factory = entityFactory;

    this.storeNode = function(node)
    {
        localStorage.setItem(target, node.generateOutput());
    }

    this.loadNode = function()
    {
        return createTreeFromString(localStorage.getItem(target), factory);
    }

    this.reset = function()
    {
        localStorage.removeItem(target);
    }
}
