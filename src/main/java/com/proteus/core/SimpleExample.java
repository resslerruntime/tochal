package com.proteus.core;

import java.io.File;

import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.owasp.webscarab.model.Preferences;
import org.owasp.webscarab.plugin.Framework;
import org.owasp.webscarab.plugin.proxy.Proxy;

import com.crawljax.util.Helper;
import com.proteus.core.configuration.ProxyConfiguration;
import com.proteus.core.staticanalysis.CallGraphAnalyzer;
import com.proteus.instrument.FunctionTrace;
import com.proteus.jsmodify.JSExecutionTracer;
import com.proteus.jsmodify.JSModifyProxyPlugin;

public class SimpleExample {

	public static final String SERVER_PREFIX2 = "--url";
	public static final String SERVER_PREFIX1 = "--u";

	private static boolean urlProvided = false;
	private static String URL = "";

	// "http://localhost:8888/phormer331/index.php";
	// "http://www.themaninblue.com/experiment/BunnyHunt/";

	private static String outputFolder = "";
	private static WebDriver driver;

	public static void main(String[] args) {
		try {

			// Iterate through arguments
			for (String arg : args) {
				// If previous argument was url flag, this argument should be the application url
				if (urlProvided == true) {
					URL = arg;
					break;
				}
				parse(arg);
			}

			if (urlProvided == false) {
				System.err.println("Invalid arguments. Please provide URL for target application as argument (E.g. --url http://localhost:8888/phormer331/index.php)");
				throw new IllegalArgumentException();
			}

			outputFolder = Helper.addFolderSlashIfNeeded("clematis-output");

			JSExecutionTracer tracer = new JSExecutionTracer("function.trace");
			tracer.setOutputFolder(outputFolder + "ftrace");

			// config.addPlugin(tracer);
			tracer.preCrawling();

			// Create a new instance of the firefox driver
/*****			FirefoxProfile profile = new FirefoxProfile();
*****/
			// Instantiate proxy components
			ProxyConfiguration prox = new ProxyConfiguration();

			// Modifier responsible for parsing Ast tree
			FunctionTrace s = new FunctionTrace();

			// Add necessary files from resources

			s.setFileNameToAttach("/esprima.js");
			s.setFileNameToAttach("/esmorph.js");
			s.setFileNameToAttach("/jsonml-dom.js");
			
			s.setFileNameToAttach("/functionNaming.js");
			
			s.setFileNameToAttach("/addvariable.js");
			
//			s.setFileNameToAttach("/asyncLogger.js");
//			s.setFileNameToAttach("/applicationView.js");
			s.setFileNameToAttach("/instrumentDOMEvents.js");
//			s.setFileNameToAttach("/domMutations.js");
//			s.setFileNameToAttach("/mutation_summary.js");
//			s.instrumentDOMModifications();
			
			s.setFileNameToAttach("/domAccessWrapper.js");
			s.setFileNameToAttach("/domAccessWrapper_send.js");
			s.setFileNameToAttach("/xhrAccessWrapper.js");


			// Interface for Ast traversal
			JSModifyProxyPlugin p = new JSModifyProxyPlugin(s);
			p.excludeDefaults();

			Framework framework = new Framework();

			/* set listening port before creating the object to avoid warnings */
			Preferences.setPreference("Proxy.listeners", "127.0.0.1:" + prox.getPort());

			Proxy proxy = new Proxy(framework);

			/* add the plugins to the proxy */
			proxy.addPlugin(p);

			framework.setSession("FileSystem", new File("convo_model"), "");

			/* start the proxy */
			proxy.run();

			if (prox != null) {
				/*****
				profile.setPreference("network.proxy.http", prox.getHostname());
				profile.setPreference("network.proxy.http_port", prox.getPort());
				profile.setPreference("network.proxy.type", prox.getType().toInt());
				// use proxy for everything, including localhost
				profile.setPreference("network.proxy.no_proxies_on", "");
				*****/
			}

/*****			driver = new FirefoxDriver(profile);
			WebDriverWait wait = new WebDriverWait(driver, 10);
*****/
			System.setProperty("webdriver.chrome.driver", "lib/chromedriver");
			
			ChromeOptions optionsChrome = new ChromeOptions();
			
			optionsChrome.addArguments("--proxy-server=http://"
					+ prox.getHostname() + ":"
					+ prox.getPort());
			
			driver = new ChromeDriver(optionsChrome);
			
			WebDriverWait wait = new WebDriverWait(driver, 10);
			
			boolean sessionOver = false;

/*****			try {
*****/				// Use WebDriver to visit specified URL
				driver.get(URL);
/*****			} catch (WebDriverException e) {
				System.err.println("Error reaching application, please ensure URL is valid.");
				e.printStackTrace();
				System.exit(1);
			}
*****/
			while (!sessionOver) {
				// Wait until the user/tester has closed the browser

				try {
					waitForWindowClose(wait);

					// At this point the window was closed, no TimeoutException
					sessionOver = true;
				} catch (TimeoutException e) {
					// 10 seconds has elapsed and the window is still open
					sessionOver = false;
				} catch (WebDriverException wde) {
					wde.printStackTrace();
					sessionOver = false;
				}
			}

			CallGraphAnalyzer callGraphAnalyzer = new CallGraphAnalyzer();
			tracer.postCrawling(callGraphAnalyzer);

		} catch (Exception e) {
			e.printStackTrace();
			System.exit(1);
		}
	}

	static boolean waitForWindowClose(WebDriverWait w) throws TimeoutException {
		// Function to check if window has been closed

		w.until(new ExpectedCondition<Boolean>() {
			public Boolean apply(WebDriver d) {
				try {
					return d.getWindowHandles().size() < 1;
				} catch (Exception e) {
					return true;
				}
			}
		});
		return true;
	}

	public static boolean isAlertPresent()
	{
		// Selenium bug where all alerts must be closed before
		try {
			driver.switchTo().alert();
			return true;
		} catch (NoAlertPresentException Ex) {
			return false;
		}
	}

	public static String getOutputFolder() {
		return Helper.addFolderSlashIfNeeded(outputFolder);
	}

	private static void parse(String arg) throws IllegalArgumentException {
		if (arg.equals(SERVER_PREFIX1) || arg.equals(SERVER_PREFIX2)) {
			urlProvided = true;
		}
	}

	private boolean checkOptions() {
		return urlProvided;
	}

}
