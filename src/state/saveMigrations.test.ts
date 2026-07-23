import { describe, expect, it } from "vitest";
import { applyMigrations, type SaveMigration } from "./saveMigrations";

describe("applyMigrations", () => {
  it("applique les migrations en chaîne jusqu'à la version cible", () => {
    const migrations: Record<number, SaveMigration> = {
      1: (data) => ({ ...data, b: "added-at-2", version: 2 }),
      2: (data) => ({ ...data, c: "added-at-3", version: 3 }),
    };

    const result = applyMigrations({ version: 1, a: "kept" }, migrations, 3);

    expect(result).toEqual({
      version: 3,
      a: "kept",
      b: "added-at-2",
      c: "added-at-3",
    });
  });

  it("s'arrête au mieux si aucune migration n'est enregistrée pour la version courante", () => {
    const result = applyMigrations({ version: 1, a: "kept" }, {}, 5);

    expect(result).toEqual({ version: 1, a: "kept" });
  });

  it("ne fait rien si la version est déjà à jour", () => {
    const migrations: Record<number, SaveMigration> = {
      1: (data) => ({ ...data, version: 2 }),
    };

    const result = applyMigrations({ version: 2, a: "kept" }, migrations, 2);

    expect(result).toEqual({ version: 2, a: "kept" });
  });

  it("ne boucle pas indéfiniment si une migration ne fait pas progresser la version", () => {
    const migrations: Record<number, SaveMigration> = {
      1: (data) => ({ ...data }), // bug volontaire : oublie de mettre à jour `version`
    };

    const result = applyMigrations({ version: 1, a: "kept" }, migrations, 5);

    expect(result).toEqual({ version: 1, a: "kept" });
  });
});
