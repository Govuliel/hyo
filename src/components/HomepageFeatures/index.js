import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Expansive',
    Svg: require('@site/static/img/undraw_off_road_re_leme.svg').default,
    description: (
      <>
        Evolved from Kokanu but with a larger lexicon. Most added words
        identified in review of Minimal English and MiniLang materials. Still 
        relies on compound phrases for complex topics but they are shorter now.
      </>
    ),
  },
  {
    title: 'Expressive',
    Svg: require('@site/static/img/undraw_animating_re_5gvn.svg').default,
    description: (
      <>
        Words are considered based upon the length and understandability of
        existing compound phrases, the commonality of the concept itself, and the
        amount of usefulness within other compound phrases.
      </>
    ),
  },
  {
    title: 'Succinct',
    Svg: require('@site/static/img/undraw_happy_feeling_re_e76r.svg').default,
    description: (
      <>
        Several new grammatical particles to increase the breadth of grammar
        that is available. Providing a greater amount of information density
        at the cost of a slight reduction in ease-of-learning.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
