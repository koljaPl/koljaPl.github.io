---
name: "ML Problems"
slug: machine-learning
category: "Machine learning"
status: published
developmentStatus: null
shortDescription: "Learning notebooks and a California housing-regression workflow comparing linear regression with a random forest."
longDescription: "An exploratory notebook collection covering data manipulation, plotting and a supervised regression example using scikit-learn."
role: null
technologies: ["Python", "Jupyter", "scikit-learn", "pandas", "NumPy"]
impact: null
featured: true
accent: "green"
order: 4
repositoryKey: "machine-learning"
links:
  [
    {
      "label": "GitHub",
      "url": "https://github.com/koljaPl/ml-problems",
      "kind": "repository",
    },
  ]
screenshots: []
customArtwork: null
seoDescription: "Learning notebooks and a California housing-regression workflow comparing linear regression with a random forest."
---

## Data and workflow

The main notebook loads scikit-learn’s California housing dataset into a pandas DataFrame, examines feature correlations, and separates features from the target. It uses an 80/20 train/test split with a fixed random seed.

## Models and inspection

The notebook fits a linear regression and a random forest with 100 estimators. It contains code to calculate mean squared error and R², plot predictions against observed values, inspect linear coefficients and visualize random-forest feature importances.

A final input routine accepts housing features and produces a model prediction. This is an educational workflow, not a deployed valuation service.

## Supporting notebooks

The `learning` directory contains NumPy, pandas and Matplotlib exercises. The declared Python dependencies also include seaborn and Jupyter.

## Limits of the evidence

The notebooks were read but not executed during this portfolio update. Saved outputs are not presented as independently reproduced results. The project does not establish production model quality, external validation or a reliable basis for financial decisions.

## Source

[Repository and implementation](https://github.com/koljaPl/ml-problems).
