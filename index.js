const express = require('express');
const cors = require('cors');
const vm = require('vm');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/execute', (req, res) => {
  const { code, functionName, test } = req.body;
  const context = {};
  let logs = [];
  // Redefinir console.log para capturar los logs
  context.console = {
    log: (...args) => {
      logs.push(args.map(String).join(' '));
    }
  };
  try {
    vm.createContext(context);
    vm.runInContext(code, context);
    const func = context[functionName];
    if (typeof func === 'function') {
      const arg = test ? JSON.parse(test) : null;
      const result = arg ? func(arg) : func();
      res.json({ success: true, result, logs });
    } else {
      res.json({ success: false, error: `No se encontró una función '${functionName}'.`, logs });
    }
  } catch (e) {
    res.json({ success: false, error: e.stack, logs });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
