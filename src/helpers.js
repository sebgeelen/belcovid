import PolynomialRegression from 'js-polynomial-regression';

export function getPolynomialRegressionPoints(data, degree = 1) {
    const regression = PolynomialRegression.read(data, degree);
        const terms = regression.getTerms();
        return data.map(point => {
            return {
                x: point.x,
                y: regression.predictY(terms, point.x),
            };
        });
}
