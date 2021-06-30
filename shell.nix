{ pkgs ? import <nixpkgs> {} }:

with pkgs;

let
  basePackages = [
    git
    nodejs
    yarn
  ];

  inputs = basePackages;
in
  mkShell {
    buildInputs = inputs;
  }
