import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

export class ComputePanel {
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
    const availableTrust = compute.getAvailableTrustPoints();

    this.trust.textContent = NumberFormatter.formatInteger(state.trust);
    this.trustUnused.textContent =
      NumberFormatter.formatInteger(availableTrust);
    this.nextTrust.textContent = NumberFormatter.formatInteger(state.nextTrust);
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

    this.btnAddProcessor.disabled = availableTrust < 1;
    this.btnAddMemory.disabled = availableTrust < 1;
  }
}
