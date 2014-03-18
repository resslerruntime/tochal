package com.proteus.jsmodify;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.mozilla.javascript.CompilerEnvirons;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Parser;
import org.mozilla.javascript.RhinoException;
import org.mozilla.javascript.ast.AstRoot;
import org.owasp.webscarab.httpclient.HTTPClient;
import org.owasp.webscarab.model.Request;
import org.owasp.webscarab.model.Response;
import org.owasp.webscarab.plugin.proxy.ProxyPlugin;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.crawljax.util.Helper;
import com.proteus.core.interactiongraph.InteractionGraph;

/**
 * The JSInstrument proxy plugin used to add instrumentation code to JavaScript files.
 */
public class JSModifyProxyPlugin extends ProxyPlugin {

	private List<String> excludeFilenamePatterns;

	public static List<String> visitedBaseUrls; // /// todo todo todo todo **********
	public static String scopeNameForExternalUse; // //// todo ********** change this later

	private final JSASTModifier modifier;

	private static String outputFolder = "";
	private static String jsFilename = "";

	/**
	 * Construct without patterns.
	 * 
	 * @param modify
	 *            The JSASTModifier to run over all JavaScript.
	 */
	public JSModifyProxyPlugin(JSASTModifier modify) {
		excludeFilenamePatterns = new ArrayList<String>();
		visitedBaseUrls = new ArrayList<String>();

		modifier = modify;

		outputFolder = Helper.addFolderSlashIfNeeded("clematis-output") + "js_snapshot";
	}

	/**
	 * Constructor with patterns.
	 * 
	 * @param modify
	 *            The JSASTModifier to run over all JavaScript.
	 * @param excludes
	 *            List with variable patterns to exclude.
	 */
	public JSModifyProxyPlugin(JSASTModifier modify, List<String> excludes) {
		excludeFilenamePatterns = excludes;
		modifier = modify;
	}

	public void excludeDefaults() {
		excludeFilenamePatterns.add(".*jquery[-0-9.]*.js?.*");
		excludeFilenamePatterns.add(".*jquery.*.js?.*");
		excludeFilenamePatterns.add(".*prototype.*js?.*");
		excludeFilenamePatterns.add(".*scriptaculous.*.js?.*");
		excludeFilenamePatterns.add(".*mootools.js?.*");
		excludeFilenamePatterns.add(".*dojo.xd.js?.*");
		excludeFilenamePatterns.add(".*trial_toolbar.js?.*");

		// Example application specific
		excludeFilenamePatterns.add(".*tabcontent.js?.*");

		excludeFilenamePatterns.add(".*toolbar.js?.*");
		excludeFilenamePatterns.add(".*jquery*.js?.*");

		// excludeFilenamePatterns.add(".*http://localhost:8888/phormer331/index.phpscript1?.*"); //
		// todo ???????

	}

	@Override
	public String getPluginName() {
		return "JSInstrumentPlugin";
	}

	@Override
	public HTTPClient getProxyPlugin(HTTPClient in) {
		return new Plugin(in);
	}

	private boolean shouldModify(String name) {
		/* try all patterns and if 1 matches, return false */
		for (String pattern : excludeFilenamePatterns) {
			if (name.matches(pattern)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * This method tries to add instrumentation code to the input it receives. The original input is
	 * returned if we can't parse the input correctly (which might have to do with the fact that the
	 * input is no JavaScript because the server uses a wrong Content-Type header for JSON data)
	 * 
	 * @param input
	 *            The JavaScript to be modified
	 * @param scopename
	 *            Name of the current scope (filename mostly)
	 * @return The modified JavaScript
	 */
	private synchronized String modifyJS(String input, String scopename) {

		System.out.println("<<<<");
		System.out.println("Scope: " + scopename);

		/***************/
		scopeNameForExternalUse = scopename; // todo todo todo todo
		/***************/

		if (!shouldModify(scopename)) {
			System.out.println("^ should not modify");
			System.out.println(">>>>");
			return input;
		}
		try {

			// Save original JavaScript files/nodes
			Helper.directoryCheck(getOutputFolder());
			setFileName(scopename);
			PrintStream output = new PrintStream(getOutputFolder() + getFilename());
//			System.out.println("MOEEEEE" + getOutputFolder() + getFilename());
			PrintStream oldOut = System.out;
			System.setOut(output);
			System.out.println(input);
			System.setOut(oldOut);

/*			PrintStream output_visual =
			        new PrintStream("src/main/webapp/fish-eye-zoom/" + getFilename());
			System.out.println("MOEEEEE" +
			        "src/main/webapp/fish-eye-zoom/" + getFilename());
			PrintStream oldOut2_visual = System.out;
			System.setOut(output_visual);
			System.out.println(input);
			System.setOut(oldOut2_visual);
*/
			AstRoot ast = null;

			/* initialize JavaScript context */
			Context cx = Context.enter();

			/* create a new parser */
			Parser rhinoParser = new Parser(new CompilerEnvirons(), cx.getErrorReporter());

			/* parse some script and save it in AST */
			ast = rhinoParser.parse(new String(input), scopename, 0);

			// modifier.setScopeName(scopename);
			modifier.setScopeName(getFilename());

			modifier.start(new String(input));

			/* recurse through AST */
			ast.visit(modifier);

			ast = modifier.finish(ast);

			/****************************/
			// todo todo todo do not instrument again if visited before
			/*
			System.out.println("--------------------------------");
			StringTokenizer tokenizer = new StringTokenizer(scopename, "?");
			String newBaseUrl = "";
			if (tokenizer.hasMoreTokens()) {
				newBaseUrl = tokenizer.nextToken();
			}
			PrintStream output2;
			try {
				output2 = new PrintStream("tempUrls.txt");
				PrintStream oldOut2 = System.out;
				System.setOut(output2);
				System.out.println("new newBaseUrl: " + newBaseUrl + "\n ---");
				boolean baseUrlExists = false;
				for (String str : visitedBaseUrls) {
					System.out.print(str);
//					if (str.startsWith(newBaseUrl) || str.equals(newBaseUrl)) {
					if (str.equals(newBaseUrl)) {
						System.out.println(" -> exists");
						// System.setOut(oldOut2);
						baseUrlExists = true;
						// return input;
					}
					else {
						System.out.println();
					}
				}
				if (!baseUrlExists)
					visitedBaseUrls.add(newBaseUrl); //
				System.setOut(oldOut2);
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			*/
			System.out.println("--------------------------------");
			/***************************/

			/* clean up */
			Context.exit();

			System.out.println(">>>>");

			return ast.toSource();
		} catch (RhinoException re) {
			System.err.println(re.getMessage()
			        + "Unable to instrument. This might be a JSON response sent"
			        + " with the wrong Content-Type or a syntax error.");

			System.err.println("details: " + re.details());
			System.err.println("getLocalizedMessage: " + re.getLocalizedMessage());
			System.err.println("getScriptStackTrace: " + re.getScriptStackTrace());
			System.err.println("lineNumber: " + re.lineNumber());
			System.err.println("lineSource: " + re.lineSource());
			System.err.println("getCause: " + re.getCause());
			re.printStackTrace();

		} catch (IllegalArgumentException iae) {
			System.err.println("Invalid operator exception catched. Not instrumenting code.");

			System.err.println("getCause: " + iae.getCause());
			System.err.println("getLocalizedMessage: " + iae.getLocalizedMessage());
			System.err.println("getMessage: " + iae.getMessage());
			iae.printStackTrace();
		} catch (IOException ioe) {
			System.err.println("Error saving original javascript files.");

			System.err.println("getMessage: " + ioe.getMessage());
			ioe.printStackTrace();
		}
		System.err.println("Here is the corresponding buffer: \n" + input + "\n");

		return input;
	}

	private void setFileName(String scopename) {
		int index = scopename.lastIndexOf("/");
		jsFilename = scopename.substring(index + 1);
	}

	private static String getOutputFolder() {
		return Helper.addFolderSlashIfNeeded(outputFolder);
	}

	private static String getFilename() {
		return jsFilename;
	}

	/**
	 * This method modifies the response to a request.
	 * 
	 * @param response
	 *            The response.
	 * @param request
	 *            The request.
	 * @return The modified response.
	 */
	private Response createResponse(Response response, Request request) {
		System.out.println("~~~~~~~~~ request begin ~~~~~~~~~");
		if (request == null) {
			System.err.println("JSModifyProxyPlugin::createResponse: request is null");
			return response;
		}
		System.out.println(request.getURL());
		if (request.getURL() == null) {
			System.err.println("JSModifyProxyPlugin::createResponse: request url is null");
			return response;
		}
		else if (request.getURL().toString().isEmpty()) {
			System.err.println("JSModifyProxyPlugin::createResponse: request url is empty");
			return response;
		}
		else if (response == null) {
			System.err.println("JSModifyProxyPlugin::createResponse: response is null");
			return response;
		}
		System.out.println("~~~~~~~~~ request end ~~~~~~~~~");
		System.out.println("~~~~~~~~~ response begin ~~~~~~~~~");
		System.out.println(response.getStatus());
		System.out.println("~~~~~~~~~ response end ~~~~~~~~~");
		String type = response.getHeader("Content-Type");
/*
		if (request.getURL().toString().contains("?beginrecord")) {
			JSExecutionTracer.preCrawling();
			return response;
		}

		if (request.getURL().toString().contains("?stoprecord")) {
			JSExecutionTracer.postCrawling();
			return response;
		}

		if (request.getURL().toString().contains("?thisisafunctiontracingcall")) {
			String rawResponse = new String(request.getContent());
			JSExecutionTracer.addPoint(rawResponse);
			return response;
		}
*/		
		// TODO ************************
		if (request.getURL().toString().contains("?DOMACCESSLOG")) {
			String rawResponse = new String(request.getContent());
			
			System.err.println("++++++++++++++++++++++++++++++++++++++++");
			System.err.println("DOMACCESSLOG");
			System.err.println(rawResponse);
			
//			DomAccessHandler.getInstance().makeAccessRelations(rawResponse);
//			DomAccessHandler.getInstance().handleDomRelations(rawResponse);
			
			InteractionGraph.getInstance().handleDomRelations(rawResponse);
			
			return response;
		}		

		if (request.getURL().toString().contains("?XHRACCESSLOG")) {
			String rawResponse = new String(request.getContent());
			
			System.err.println("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
			System.err.println("XHRACCESSLOG");
			System.err.println(rawResponse);
			
			InteractionGraph.getInstance().handleXhrRelations(rawResponse);
			
			return response;
		}		

		if (type != null && type.contains("javascript")) {

			/* instrument the code if possible */
			response.setContent(modifyJS(new String(response.getContent()),
			        request.getURL().toString()).getBytes());
		} else if (type != null && type.contains("html")) {
			try {
				Document dom = Helper.getDocument(new String(response.getContent()));
				/* find script nodes in the html */
				NodeList nodes = dom.getElementsByTagName("script");

				for (int i = 0; i < nodes.getLength(); i++) {
					Node nType = nodes.item(i).getAttributes().getNamedItem("type");
					/* instrument if this is a JavaScript node */
					if ((nType != null && nType.getTextContent() != null && nType
					        .getTextContent().toLowerCase().contains("javascript"))) {
						String content = nodes.item(i).getTextContent();

						if (content.length() > 0) {
							String js = modifyJS(content, request.getURL() + "script" + i);
							System.out.println(js);
							nodes.item(i).setTextContent(js);
							System.out.println(nodes.item(i).getTextContent());
							continue;
						}
					}

					/* also check for the less used language="javascript" type tag */
					nType = nodes.item(i).getAttributes().getNamedItem("language");
					if ((nType != null && nType.getTextContent() != null && nType
					        .getTextContent().toLowerCase().contains("javascript"))) {
						String content = nodes.item(i).getTextContent();
						if (content.length() > 0) {
							String js = modifyJS(content, request.getURL() + "script" + i);
							nodes.item(i).setTextContent(js);
						}

					}
				}
				/* only modify content when we did modify anything */
				if (nodes.getLength() > 0) {
					/* set the new content */
					response.setContent(Helper.getDocumentToByteArray(dom));
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		/* return the response to the webbrowser */
		return response;
	}

	/**
	 * WebScarab plugin that adds instrumentation code.
	 */
	private class Plugin implements HTTPClient {

		private HTTPClient client = null;

		/**
		 * Constructor for this plugin.
		 * 
		 * @param in
		 *            The HTTPClient connection.
		 */
		public Plugin(HTTPClient in) {
			client = in;
		}

		public Response fetchResponse(Request request) throws IOException {

			Response response = client.fetchResponse(request);
			return createResponse(response, request);
		}
	}

}
