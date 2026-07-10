module.exports = {
  ci: {
    collect: {
      settings: {
        extraHeaders: JSON.stringify({
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_TOKEN || ''
        })
      }
    }
  }
};
