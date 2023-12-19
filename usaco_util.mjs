// run `node usaco_util.mjs`
import { writeFileSync } from 'fs';
import * as readline from 'readline';
import axios from 'axios';
import extraProblems from './content/extraProblems.json' assert { type: 'json' };
import div_to_probs from './src/components/markdown/ProblemsList/DivisionList/div_to_probs.json' assert { type: 'json' };
import id_to_sol from './src/components/markdown/ProblemsList/DivisionList/id_to_sol.json' assert { type: 'json' };
import * as prettier from 'prettier';

const month_to_id = {
  December: 'dec',
  January: 'jan',
  February: 'feb',
  'US Open': 'open',
};
const rl = readline.createInterface(process.stdin, process.stdout);
rl.question('Enter USACO ID: ', id => {
  const url = `http://usaco.org/index.php?page=viewproblem2&cpid=${id}`;
  axios
    .get(url)
    .then(async response => {
      const htmlContent = response.data;
      const problem = htmlContent.match(/<h2> Problem (\d). (.*) <\/h2>/);
      const number = problem[1],
        title = problem[2];
      const contest = htmlContent.match(
        /<h2> USACO (\d+) (December|January|February|(?:US Open)) Contest, (Bronze|Silver|Gold|Platinum) <\/h2>/
      );
      const year = contest[1],
        month = contest[2],
        division = contest[3];
      console.log('Problem', number, title, year, month, division);
      const newEntry = {
        uniqueId: `usaco-${id}`,
        name: title,
        url: `http://usaco.org/index.php?page=viewproblem2&cpid=${id}`,
        source: division,
        difficulty: 'Easy',
        isStarred: false,
        tags: [],
        solutionMetadata: {
          kind: 'USACO',
          usacoId: id,
        },
      };
      console.log(newEntry);
      extraProblems.EXTRA_PROBLEMS.push(newEntry);
      writeFileSync(
        './content/extraProblems.json',
        await prettier.format(JSON.stringify(extraProblems, null, '\t'), {
          parser: 'json',
        }),
        'utf8'
      );
      div_to_probs[division].push([id, `${year} ${month}`, title]);
      writeFileSync(
        './src/components/markdown/ProblemsList/DivisionList/div_to_probs.json',
        await prettier.format(JSON.stringify(div_to_probs, null, '\t'), {
          parser: 'json',
        }),
        'utf8'
      );
      id_to_sol[id] = `sol_prob${number}_${division.toLowerCase()}_${
        month_to_id[month]
      }${year.slice(2)}.html`;
      writeFileSync(
        './src/components/markdown/ProblemsList/DivisionList/id_to_sol.json',
        await prettier.format(JSON.stringify(id_to_sol, null, '\t'), {
          parser: 'json',
        }),
        'utf8'
      );
      console.log('Problem added!');
      process.exit();
    })
    .catch(error => {
      console.error('Error retrieving HTML content:', error);
    });
});