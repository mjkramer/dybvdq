import { Subject } from 'rxjs';

// Observer: DataViz
// Sources: ShiftButton, RunAndFile, HallSelector
export const plzReportTaggings = new Subject();

// Observer: DataViz
// Source: TagSelectionButton
export const plzTagSelection = new Subject();
export const plzUntagSelection = new Subject();

// Observer: DataViz
// Source; thunks.reportAndShiftPage

// HACK: DataViz will purge upon first receiving new props. However, for a
// shiftPage, we won't know the new runno/fileno until the fetchData has
// completed. In order to provide immediate feedback, we use this Subject to
// tell DataViz to purge the plots, even though props haven't changed.
// Or not???
// export const plzPurgePlots = new Subject();
