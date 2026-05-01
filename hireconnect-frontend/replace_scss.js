const fs = require('fs');
const file = 'src/app/dashboard/dashboard.component.scss';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const target = `.recommended-section { margin-bottom: 1.5rem; background: $surface; border-radius: .85rem; border: 1px solid $border; padding: 1.25rem;
  .job-list { display: flex; flex-direction: column; gap: 0;
    .job-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .85rem 0; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap;
      &:last-child { border-bottom: none; }
      .job-row-left { display: flex; align-items: center; gap: .85rem; flex: 1; min-width: 0;
        .job-row-info { min-width: 0; h3 { font-size: .88rem; font-weight: 700; color: $dark; margin: 0 0 .15rem; } p { font-size: .72rem; color: $muted; margin: 0 0 .35rem; } .job-tags { display: flex; gap: .4rem; flex-wrap: wrap; .tag { background: #eff6ff; color: $primary; font-size: .6rem; font-weight: 700; padding: .15rem .45rem; border-radius: 100px; } } }
      }
      .job-row-right { display: flex; align-items: center; gap: .75rem; flex-shrink: 0; .match-score { font-size: .7rem; font-weight: 800; color: #16a34a; background: #dcfce7; padding: .2rem .55rem; border-radius: 100px; } .salary { font-size: .72rem; font-weight: 700; color: $muted; } .btn-apply { background: $primary; color: #fff; border: none; padding: .4rem .9rem; border-radius: .4rem; font-weight: 700; font-size: .72rem; cursor: pointer; &:hover { background: $primary-light; } } }
    }
  }
}`.replace(/\r\n/g, '\n');

const replacement = `.recommended-section { margin-bottom: 1.5rem; background: $surface; border-radius: .85rem; border: 1px solid $border; padding: 1.25rem;
  .job-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 600px) { grid-template-columns: 1fr; }
    .job-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #e2e8f0; border-radius: 0.85rem; padding: 1.25rem; transition: transform 0.2s, box-shadow 0.2s; &:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #2a14b4; }
      .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; 
        .company-logo-circle { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, $primary, $primary-light); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; }
        .match-score { font-size: 0.7rem; font-weight: 800; color: #16a34a; background: #dcfce7; padding: 0.2rem 0.55rem; border-radius: 100px; }
      }
      .card-body { flex: 1; margin-bottom: 1rem;
        h3 { font-size: 1.05rem; font-weight: 800; color: $dark; margin: 0 0 0.25rem; }
        .company-name { font-size: 0.85rem; font-weight: 600; color: $primary; margin: 0 0 0.25rem; }
        .job-meta { font-size: 0.75rem; color: $muted; margin: 0 0 0.75rem; }
        .job-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; .tag { background: #eff6ff; color: $primary; font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 100px; } }
      }
      .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 1rem;
        .salary { font-size: 0.8rem; font-weight: 700; color: $dark; }
        .btn-apply { background: $primary; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: background 0.2s; white-space: nowrap; &:hover { background: $primary-light; } }
      }
    }
  }
}

.load-more-container { text-align: center; margin-top: 2rem; .btn-outline { border: 1.5px solid #e2e8f0; background: transparent; color: #0f172a; padding: 0.6rem 1.5rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s; &:hover { border-color: #2a14b4; color: #2a14b4; background: #eff6ff; } } }`.replace(/\r\n/g, '\n');

if (content.includes(target)) {
    fs.writeFileSync(file, content.replace(target, replacement));
    console.log('Successfully replaced content.');
} else {
    console.log('Target string not found in file!');
}
