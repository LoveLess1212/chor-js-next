
/**
 * Provides a popup menu for linking participants between choreographies,
 * i.e., when using call choreographies.
 *
 * @constructor
 * @param {PopupMenu} popupMenu
 * @param {ChoreoModeling} modeling
 * @param {Moddle} moddle {Moddle}
 */
export default function ParticipantLinkingPopupProvider(popupMenu, modeling, moddle) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;

  popupMenu.registerProvider('participant-linking-provider', this);
}


ParticipantLinkingPopupProvider.$inject = [
  'popupMenu',
  'modeling',
  'moddle'
];


ParticipantLinkingPopupProvider.prototype.getPopupMenuEntries = function(element) {
  const entries = {};
  const callChoreoBo = element.activityShape.businessObject;
  const participants = callChoreoBo.calledChoreographyRef.participants || [];
  let outerParticipant = element.businessObject;
  let currentInnerParticipant;

  if (callChoreoBo.participantAssociations) {
    const participantAssociation = callChoreoBo.participantAssociations.find(
      pa => pa.outerParticipantRef === element.businessObject);

    if (participantAssociation) {
      currentInnerParticipant = participantAssociation.innerParticipantRef;
    }
  }

  participants.forEach(p => entries[p.id] = {
    label: p.name,
    id: p.id,
    active: p === currentInnerParticipant,
    action: () => this._modeling.linkCallChoreoParticipant(callChoreoBo, outerParticipant, p)
  });

  if (Object.keys(entries).length === 0) {
    entries['select-none'] = {
      id: 'select-none',
      className: 'italic',
      label: 'no targets found'
    };
  }

  return entries;
};

ParticipantLinkingPopupProvider.prototype.register = function() {
  this._popupMenu.registerProvider('participant-linking-provider', this);
};