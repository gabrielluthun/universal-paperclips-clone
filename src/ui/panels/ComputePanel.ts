import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

export class ComputePanel {
  private readonly trustRow = requireElement<HTMLElement>("trust-row");
  private readonly nextTrustRow = requireElement<HTMLElement>("next-trust-row");
  private readonly swarmGiftsRow = requireElement<HTMLElement>(
    "compute-swarm-gifts-row",
  );
  private readonly swarmGifts = requireElement<HTMLSpanElement>(
    "compute-swarm-gifts",
  );
  private readonly trust = requireElement<HTMLSpanElement>("trust");
  private readonly trustUnused =
    requireElement<HTMLSpanElement>("trust-unused");
  private readonly nextTrust = requireElement<HTMLSpanElement>("next-trust");
  private readonly processors = requireElement<HTMLSpanElement>("processors");
  private readonly memory = requireElement<HTMLSpanElement>("memory");
  private readonly ops = requireElement<HTMLSpanElement>("ops");
  private readonly opsMax = requireElement<HTMLSpanElement>("ops-max");
  private readonly creativity = requireElement<HTMLSpanElement>("creativity");
  private readonly creativityRow =
    requireElement<HTMLDivElement>("creativity-row");
  private readonly btnAddProcessor =
    requireElement<HTMLButtonElement>("btn-add-processor");
  private readonly btnAddMemory =
    requireElement<HTMLButtonElement>("btn-add-memory");

  render(model: RenderModel): void {
    const { state, compute } = model;
    const swarmMode = state.swarmComputingUnlocked;
    const availableTrust = compute.getAvailableTrustPoints();

    this.trustRow.hidden = swarmMode;
    this.nextTrustRow.hidden = swarmMode;
    this.swarmGiftsRow.hidden = !swarmMode;

    this.trust.textContent = NumberFormatter.formatInteger(state.trust);
    this.trustUnused.textContent =
      NumberFormatter.formatInteger(availableTrust);
    this.nextTrust.textContent = NumberFormatter.formatInteger(state.nextTrust);
    this.swarmGifts.textContent = NumberFormatter.formatInteger(
      state.swarmGifts,
    );
    this.processors.textContent = NumberFormatter.formatInteger(
      state.processors,
    );
    this.memory.textContent = NumberFormatter.formatInteger(state.memory);
    this.ops.textContent = NumberFormatter.formatInteger(state.ops);
    this.opsMax.textContent = NumberFormatter.formatInteger(
      compute.getOperationsCapacity(),
    );
    this.creativity.textContent = NumberFormatter.formatInteger(
      state.creativity,
    );
    this.creativityRow.hidden = !state.creativityUnlocked;

    const canAllocate = swarmMode
      ? state.swarmGifts >= 1
      : availableTrust >= 1;
    this.btnAddProcessor.disabled = !canAllocate;
    this.btnAddMemory.disabled = !canAllocate;
    this.btnAddProcessor.title = swarmMode
      ? "Dépenser 1 cadeau de calcul"
      : "Allouer 1 confiance";
    this.btnAddMemory.title = this.btnAddProcessor.title;
  }
}
