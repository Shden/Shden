// ESP controllers gate. Simply replicates AWS reported state, nothing  more.

let currentState = new Object();

// Returns REST object representing current ESP state
async function getState()
{
        return new Promise((resolved, rejected) => {
                resolved(currentState);
        });
}

// Update cached state
async function updateCachedState(updatedState)
{
        // let currentState = await getState();
        currentState = { ...currentState, ...updatedState }; // NB! shallow merge

        return new Promise((resolved, rejected) => {
                resolved(currentState);
         });
}

exports.getState = getState;
exports.updateCachedState = updateCachedState;