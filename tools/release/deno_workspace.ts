// Copyright 2018-2026 the Deno authors. MIT license.

import { $, ReleasesMdFile, Repo } from "./deps.ts";

export class EdnoWorkspace {
  #repo: Repo;

  static get rootDirPath() {
    const currentDirPath = $.path(import.meta.dirname!);
    return currentDirPath.parentOrThrow().parentOrThrow();
  }

  static async load(): Promise<EdnoWorkspace> {
    return new EdnoWorkspace(
      await Repo.load({
        name: "edno",
        path: EdnoWorkspace.rootDirPath,
      }),
    );
  }

  private constructor(repo: Repo) {
    this.#repo = repo;
  }

  get repo() {
    return this.#repo;
  }

  get crates() {
    return this.#repo.crates;
  }

  /** Gets the CLI dependency crates that should be published. */
  getCliDependencyCrates() {
    return this.getCliCrate()
      .descendantDependenciesInRepo()
      .filter((c) =>
        c.name !== "test_server" && c.name !== "test_macro" &&
        c.name !== "test_util"
      );
  }

  getCliCrate() {
    return this.getCrate("edno");
  }

  getDenoRtCrate() {
    return this.getCrate("ednort");
  }

  getDenoLibCrate() {
    return this.getCrate("edno_lib");
  }

  getCrate(name: string) {
    return this.#repo.getCrate(name);
  }

  getReleasesMdFile() {
    return new ReleasesMdFile(
      EdnoWorkspace.rootDirPath.join("Releases.md").toString(),
    );
  }

  async runFormatter() {
    await this.#repo.command(
      "edno run --allow-write --allow-read --allow-net --allow-run ./tools/format.js",
    );
  }
}
