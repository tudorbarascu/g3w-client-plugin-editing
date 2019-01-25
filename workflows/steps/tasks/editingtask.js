const inherit = g3wsdk.core.utils.inherit;
const base =  g3wsdk.core.utils.base;
const GUI = g3wsdk.gui.GUI;
const Task = g3wsdk.core.workflow.Task;

function EditingTask(options = {}) {
  base(this, options);
  this._mapService = GUI.getComponent('map').getService();
  this.addInteraction = function(interaction) {
    this._mapService.addInteraction(interaction);
  };
  this.removeInteraction = function(interaction) {
    this._mapService.removeInteraction(interaction);
  };
}

inherit(EditingTask, Task);

const proto = EditingTask.prototype;

proto.run = function(inputs, context) {};

proto.stop = function() {};

proto.removeFromOrphanNodes = function(id) {
  const EditingService = require('../../../services/editingservice');
  const orphannodes = EditingService.getOrphanNodes();
  const filterednodes = orphannodes.filter((node) => {
    return node.getId() !== id;
  });
  EditingService.setOrphanNodes(filterednodes);
};

proto.checkOrphanNodes = function() {
  const EditingService = require('../../../services/editingservice');
  EditingService.checkOrphanNodes();
};

module.exports = EditingTask;
