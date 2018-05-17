
var fs = require('fs');

try { fs.unlinkSync('municipality.seed') } catch (e) {}
try { fs.unlinkSync('hotelier.seed') } catch (e) {}
try { fs.unlinkSync('recipient.seed') } catch (e) {}
try { fs.unlinkSync('visitor.seed') } catch (e) {}
try { fs.unlinkSync('event.seed') } catch (e) {}
try { fs.unlinkSync('municipality.state') } catch (e) {}
try { fs.unlinkSync('hotelier.state') } catch (e) {}
try { fs.unlinkSync('recipient.state') } catch (e) {}
try { fs.unlinkSync('visitor.state') } catch (e) {}
try { fs.unlinkSync('iterator.state') } catch (e) {}
try { fs.unlinkSync('event.state') } catch (e) {}
try { fs.unlinkSync('hotelier.attest') } catch (e) {}
try { fs.unlinkSync('recipient.attest') } catch (e) {}