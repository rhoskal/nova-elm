{ pkgs ? import <nixpkgs> { } }:

with pkgs;

let
  basePackages = [ git nixfmt nodejs yarn ];

  inputs = basePackages;
in mkShell { buildInputs = inputs; }
