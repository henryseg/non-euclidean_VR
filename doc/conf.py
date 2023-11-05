# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = '3-D.S'
copyright = '2023, Rémi Coulon, Sabetta Matsumoto, Henry Segerman, Steve Trettel'
author = 'Rémi Coulon, Sabetta Matsumoto, Henry Segerman, Steve Trettel'
release = '2.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinx_js', 'myst_parser']
js_source_path = '../src/'
jsdoc_config_path = './jsdoc.conf.json'
primary_domain = 'js'
myst_enable_extensions = ["dollarmath", "amsmath"]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
highlight_language = 'javascript'
