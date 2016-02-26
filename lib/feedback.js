/**
 */


var FeedbackLevel = {
    Normal : 1,
    Warning : 2,
    Error : 3
};

function Feedback(displayer)
{
    var displayerMethod = displayer;
    var logger = new Logger('feedback')

    this.addMessage = function(message, level)
    {
        logger.info(message);
        displayer(message, level);
    }
}
