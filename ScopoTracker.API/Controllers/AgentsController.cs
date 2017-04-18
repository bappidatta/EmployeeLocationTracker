using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using ScopoTracker.API.Models;

namespace ScopoTracker.API.Controllers
{
    [Authorize]
    public class AgentsController : ApiController
    {
        private ScopoTrackerContext db = new ScopoTrackerContext();

        // GET: api/Agents
        public IQueryable<Agent> GetAgent()
        {
            return db.Agent;
        }

        // GET: api/Agents/5
        [ResponseType(typeof(Agent))]
        public IHttpActionResult GetAgent(int id)
        {
            Agent agent = db.Agent.Find(id);
            if (agent == null)
            {
                return NotFound();
            }

            return Ok(agent);
        }

        // PUT: api/Agents/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutAgent(int id, Agent agent)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != agent.AgentID)
            {
                return BadRequest();
            }

            db.Entry(agent).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AgentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Agents
        [ResponseType(typeof(Agent))]
        public IHttpActionResult PostAgent(Agent agent)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Agent.Add(agent);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = agent.AgentID }, agent);
        }

        // DELETE: api/Agents/5
        [ResponseType(typeof(Agent))]
        public IHttpActionResult DeleteAgent(int id)
        {
            Agent agent = db.Agent.Find(id);
            if (agent == null)
            {
                return NotFound();
            }

            db.Agent.Remove(agent);
            db.SaveChanges();

            return Ok(agent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AgentExists(int id)
        {
            return db.Agent.Count(e => e.AgentID == id) > 0;
        }
    }
}