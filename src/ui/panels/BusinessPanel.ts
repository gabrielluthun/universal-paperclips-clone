import { MarketSystem } from "../../systems/market/MarketSystem";
import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

export class BusinessPanel {
  private readonly panel = requireElement<HTMLElement>("panel-business");
  private readonly manufacturingPanel = requireElement<HTMLElement>(
    "panel-manufacturing",
  );
  private readonly clips = requireElement<HTMLSpanElement>("clips");
  private readonly funds = requireElement<HTMLSpanElement>("funds");
  private readonly avgRev = requireElement<HTMLSpanElement>("avg-rev");
  private readonly unsold = requireElement<HTMLSpanElement>("unsold");
  private readonly price = requireElement<HTMLSpanElement>("price");
  private readonly demand = requireElement<HTMLSpanElement>("demand");
  private readonly marketingLvl =
    requireElement<HTMLSpanElement>("marketing-lvl");
  private readonly marketingCost =
    requireElement<HTMLSpanElement>("marketing-cost");
  private readonly clipRate = requireElement<HTMLSpanElement>("clip-rate");
  private readonly wire = requireElement<HTMLSpanElement>("wire");
  private readonly wireCost = requireElement<HTMLSpanElement>("wire-cost");
  private readonly autoClippers =
    requireElement<HTMLSpanElement>("autoclippers");
  private readonly autoClipperCost =
    requireElement<HTMLSpanElement>("autoclipper-cost");
  private readonly autoClipperBlock =
    requireElement<HTMLDivElement>("autoclipper-block");
  private readonly megaClippers =
    requireElement<HTMLSpanElement>("megaclippers");
  private readonly megaClipperCost =
    requireElement<HTMLSpanElement>("megaclipper-cost");
  private readonly megaClipperBlock =
    requireElement<HTMLDivElement>("megaclipper-block");
  private readonly btnMake = requireElement<HTMLButtonElement>("btn-make");
  private readonly btnBuyWire =
    requireElement<HTMLButtonElement>("btn-buy-wire");
  private readonly btnPriceDown =
    requireElement<HTMLButtonElement>("btn-price-down");
  private readonly btnMarketing =
    requireElement<HTMLButtonElement>("btn-marketing");
  private readonly btnBuyAutoClipper =
    requireElement<HTMLButtonElement>("btn-buy-autoclipper");
  private readonly btnBuyMegaClipper =
    requireElement<HTMLButtonElement>("btn-buy-megaclipper");

  render(model: RenderModel): void {
    const { state, production, market } = model;

    // Affaires + fabrication manuelle : propres à la phase 1.
    this.panel.hidden = state.phase !== 1;
    this.manufacturingPanel.hidden = state.phase !== 1;
    this.btnMake.hidden = state.phase !== 1;

    this.clips.textContent = NumberFormatter.formatInteger(state.clips);
    this.funds.textContent = NumberFormatter.formatMoney(state.funds);
    this.avgRev.textContent = NumberFormatter.formatMoney(model.avgRev);
    this.unsold.textContent = NumberFormatter.formatInteger(state.unsold);
    this.price.textContent = NumberFormatter.formatMoney(state.price);
    this.demand.textContent = `${NumberFormatter.formatInteger(market.getPublicDemand() * 10)} %`;
    this.marketingLvl.textContent = NumberFormatter.formatInteger(
      state.marketingLvl,
    );
    this.marketingCost.textContent = NumberFormatter.formatMoney(
      market.getNextMarketingLevelCost(),
    );
    this.clipRate.textContent = NumberFormatter.formatInteger(model.clipRate);
    this.wire.textContent = `${NumberFormatter.formatInteger(state.wire)} cm`;
    this.wireCost.textContent = NumberFormatter.formatMoney(state.wireCost);
    this.autoClippers.textContent = NumberFormatter.formatInteger(
      state.autoClippers,
    );
    this.autoClipperCost.textContent = NumberFormatter.formatMoney(
      production.getNextAutoClipperCost(),
    );
    this.megaClippers.textContent = NumberFormatter.formatInteger(
      state.megaClippers,
    );
    this.megaClipperCost.textContent = NumberFormatter.formatMoney(
      production.getNextMegaClipperCost(),
    );

    // Auto / Méga : fabrication phase 1 uniquement (obsolètes dès la Terre).
    this.autoClipperBlock.hidden =
      state.phase !== 1 || !state.autoClippersUnlocked;
    this.megaClipperBlock.hidden =
      state.phase !== 1 || !state.megaClippersUnlocked;

    this.btnMake.disabled =
      state.wire < 1n || model.production.isProductionHalted();
    this.btnBuyWire.disabled = state.funds < state.wireCost;
    this.btnPriceDown.disabled = state.price <= MarketSystem.PRICE_MIN;
    this.btnMarketing.disabled =
      state.funds < market.getNextMarketingLevelCost();
    this.btnBuyAutoClipper.disabled =
      state.funds < production.getNextAutoClipperCost();
    this.btnBuyMegaClipper.disabled =
      state.funds < production.getNextMegaClipperCost();
  }
}
