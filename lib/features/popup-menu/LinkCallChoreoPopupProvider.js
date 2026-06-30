import { is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Provides a list of choreographies to link call choreographies to.
 * @constructor
 * @param {PopupMenu} popupMenu
 * @param {Modeling|ChoreoModeling} modeling
 * @param {ChoreoUtil} choreoUtil
 */
export default function LinkCallChoreoProvider(popupMenu, modeling, choreoUtil) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._choreoUtil = choreoUtil;

  popupMenu.registerProvider('link-call-choreo-provider', this);
}


LinkCallChoreoProvider.$inject = [
  'popupMenu',
  'modeling',
  'choreoUtil'
];

LinkCallChoreoProvider.prototype.getEntries = function(element) {
  const entries = {};
  if (is(element, 'bpmn:CallChoreography')) {
    const currentChoreo = this._choreoUtil.currentChoreography();
    const currentRef = element.businessObject.calledChoreographyRef;
    this._choreoUtil.choreographies().filter(choreo => choreo.id !== currentChoreo.id).forEach(choreo => {
      const name = choreo.name || choreo.id;
      entries['select-' + choreo.id] = {
        id: ('select-' + choreo.id),
        label: name,
        active: currentRef === choreo,
        action: () => this._modeling.linkCallChoreo(element.businessObject, choreo)
      };
    });
    if (Object.keys(entries).length == 0) {
      entries['select-none'] = {
        id: 'select-none',
        className: 'italic',
        label: 'no targets found'
      };
    }
  }
  return entries;
};

LinkCallChoreoProvider.prototype.register = function() {
  this._popupMenu.registerProvider('link-call-choreo-provider', this);
};