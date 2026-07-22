import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

export class StrategicPanel {
  private lastPickerSignature = "";

  private readonly panel = requireElement<HTMLElement>("panel-strategic");
  private readonly yomi = requireElement<HTMLSpanElement>("strategic-yomi");
  private readonly tourneyCost =
    requireElement<HTMLSpanElement>("tourney-cost");
  private readonly stratPicker =
    requireElement<HTMLSelectElement>("strat-picker");
  private readonly btnRunTourney =
    requireElement<HTMLButtonElement>("btn-run-tourney");
  private readonly tourneyGrid = requireElement<HTMLElement>("tourney-grid");
  private readonly tourneyLabelA =
    requireElement<HTMLSpanElement>("tourney-label-a");
  private readonly tourneyLabelB =
    requireElement<HTMLSpanElement>("tourney-label-b");
  private readonly payoffHA =
    requireElement<HTMLTableCellElement>("payoff-h-a");
  private readonly payoffHB =
    requireElement<HTMLTableCellElement>("payoff-h-b");
  private readonly payoffVA =
    requireElement<HTMLTableCellElement>("payoff-v-a");
  private readonly payoffVB =
    requireElement<HTMLTableCellElement>("payoff-v-b");
  private readonly payoffAA =
    requireElement<HTMLTableCellElement>("payoff-aa");
  private readonly payoffAB =
    requireElement<HTMLTableCellElement>("payoff-ab");
  private readonly payoffBA =
    requireElement<HTMLTableCellElement>("payoff-ba");
  private readonly payoffBB =
    requireElement<HTMLTableCellElement>("payoff-bb");
  private readonly tourneyResults =
    requireElement<HTMLElement>("tourney-results");
  private readonly tourneyYomiGained =
    requireElement<HTMLSpanElement>("tourney-yomi-gained");
  private readonly tourneyResultsList =
    requireElement<HTMLOListElement>("tourney-results-list");

  render(model: RenderModel): void {
    const { state, strategic } = model;
    this.panel.hidden = !state.strategicModelingUnlocked;

    // Toujours formater les compteurs fixes (slots de lissage stables).
    this.yomi.textContent = NumberFormatter.formatInteger(state.yomi);
    this.tourneyCost.textContent = NumberFormatter.formatInteger(
      strategic.getTourneyCost(),
    );
    this.tourneyYomiGained.textContent = NumberFormatter.formatInteger(
      state.lastTourneyYomiGained,
    );

    if (!state.strategicModelingUnlocked) return;

    this.btnRunTourney.disabled = !strategic.canRunTournament();

    const unlocked = strategic.getUnlockedStrategies();
    const pickerSig = `${unlocked.join(",")}|${state.selectedStrategyId}`;
    if (pickerSig !== this.lastPickerSignature) {
      this.lastPickerSignature = pickerSig;
      this.stratPicker.replaceChildren();
      for (const id of unlocked) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = id.replaceAll("_", " ");
        if (id === state.selectedStrategyId) option.selected = true;
        this.stratPicker.appendChild(option);
      }
    } else {
      this.stratPicker.value = state.selectedStrategyId;
    }

    const payoff = state.tourneyPayoff;
    const hasGrid = payoff !== null;
    this.tourneyGrid.hidden = !hasGrid;
    if (hasGrid && payoff) {
      this.tourneyLabelA.textContent = state.tourneyChoiceA;
      this.tourneyLabelB.textContent = state.tourneyChoiceB;
      this.payoffHA.textContent = state.tourneyChoiceA;
      this.payoffHB.textContent = state.tourneyChoiceB;
      this.payoffVA.textContent = state.tourneyChoiceA;
      this.payoffVB.textContent = state.tourneyChoiceB;
      this.payoffAA.textContent = `${payoff.aa},${payoff.aa}`;
      this.payoffAB.textContent = `${payoff.ab},${payoff.ba}`;
      this.payoffBA.textContent = `${payoff.ba},${payoff.ab}`;
      this.payoffBB.textContent = `${payoff.bb},${payoff.bb}`;
    }

    const hasResults = state.tourneyResults.length > 0;
    this.tourneyResults.hidden = !hasResults;
    if (hasResults) {
      this.tourneyResultsList.replaceChildren();
      for (const row of state.tourneyResults) {
        const li = document.createElement("li");
        li.textContent = `${row.name} : ${NumberFormatter.formatIntegerExact(row.score)}`;
        if (row.id === state.selectedStrategyId) li.className = "picked";
        this.tourneyResultsList.appendChild(li);
      }
    }
  }
}
